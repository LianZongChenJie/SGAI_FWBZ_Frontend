const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const round5 = value => Math.round(value / 5) * 5
const round1 = value => Number(value.toFixed(1))

function timeToMinutes(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

function minutesToTime(value) {
  const minutes = ((Math.round(value) % 1440) + 1440) % 1440
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function validNumber(value, fallback) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

/**
 * 会展场馆能源站优化模型。
 *
 * 启停求解与运行参数寻优相互独立：
 * 1. 活动开闭馆时间是硬边界；末端温湿度和历史梯度只参与分析，不生成末端控制命令。
 * 2. 每馆先求“最晚安全启动”和“最早安全停机”，整站取最严格场馆作为约束。
 * 3. 气象、电价和 P90 负荷用于修正预冷、供水温度及泵塔建议，所有结果仍需能力矩阵决定是否可下发。
 */
export function optimizeExhibitionPlant(input = {}) {
  const weather = input.weather || {}
  const tariff = input.tariff || {}
  const halls = (input.halls || []).filter(hall => hall.occupied !== false && timeToMinutes(hall.openTime) != null && timeToMinutes(hall.closeTime) != null)
  const dryBulb = validNumber(weather.dryBulb, 26)
  const wetBulb = validNumber(weather.wetBulb, 21)
  const solarRadiation = validNumber(weather.solarRadiation, 0)
  const currentPrice = validNumber(tariff.currentPrice, 0.68)
  const peakStart = timeToMinutes(tariff.nextPeakStart)
  const loadP90 = Math.max(0, validNumber(input.loadP90, 0))
  const designCapacity = Math.max(1, validNumber(input.designCapacity, 9000))
  const plantPower = Math.max(1, validNumber(input.plantPower, 1175))
  const loadRatio = clamp(loadP90 / designCapacity, 0, 1.2)
  const totalAttendance = halls.reduce((sum, hall) => sum + Math.max(0, validNumber(hall.expectedAttendance, 0)), 0)
  const earliestOpen = halls.length ? Math.min(...halls.map(hall => timeToMinutes(hall.openTime))) : 9 * 60
  const latestClose = halls.length ? Math.max(...halls.map(hall => timeToMinutes(hall.closeTime))) : 18 * 60

  const outdoorSeverity = clamp(
    Math.max(0, dryBulb - 28) * 0.025 + Math.max(0, wetBulb - 22) * 0.032 + solarRadiation / 9000,
    0,
    0.34
  )
  const highPrice = currentPrice >= 1 || (peakStart != null && peakStart <= earliestOpen + 120)
  const priceShiftMinutes = highPrice ? 10 : 0

  const hallSchedules = halls.map(hall => {
    const terminal = hall.terminal || {}
    const open = timeToMinutes(hall.openTime)
    const close = timeToMinutes(hall.closeTime)
    const attendance = Math.max(0, validNumber(hall.expectedAttendance, 0))
    const indoorTemp = validNumber(terminal.indoorTemp, 27)
    const targetTemp = validNumber(terminal.targetTemp, 24.5)
    const maxOpenTemp = Math.max(targetTemp + 0.4, validNumber(terminal.maxOpenTemp, 25.5))
    const coolingGradient = clamp(validNumber(terminal.coolingGradient, 2.2), 0.5, 6)
    const driftGradient = clamp(validNumber(terminal.driftGradient, 0.75), 0.15, 3)
    const sampleDays = Math.max(0, validNumber(terminal.sampleDays, 0))
    const comfortAtOpenRate = clamp(validNumber(terminal.comfortAtOpenRate, 80), 0, 100)
    const dataQuality = String(terminal.dataQuality || 'unknown').toLowerCase()

    const projectedHeatGain = Math.max(0, dryBulb - indoorTemp) * 0.012 + solarRadiation / 4500 + attendance / 50000
    const projectedStartTemp = indoorTemp + projectedHeatGain
    const effectiveCoolingGradient = Math.max(0.45, coolingGradient * (1 - outdoorSeverity * 0.3))
    const requiredDrop = Math.max(0, projectedStartTemp - targetTemp)
    const distributionLag = clamp(12 + attendance / 2200 + Math.max(0, wetBulb - 23), 12, 28)
    const sparseDataBuffer = sampleDays < 7 ? 20 : sampleDays < 14 ? 10 : 5
    const qualityBuffer = dataQuality === 'good' ? 0 : dataQuality === 'fair' ? 10 : 20
    const conditioningMinutes = requiredDrop / effectiveCoolingGradient * 60
    const safeLeadMinutes = round5(clamp(conditioningMinutes + distributionLag + sparseDataBuffer + qualityBuffer, 20, 180))
    const latestSafeStartMinutes = open - safeLeadMinutes
    const recommendedStartMinutes = latestSafeStartMinutes - priceShiftMinutes

    const occupiedHeatFactor = 1 + outdoorSeverity * 0.75 + attendance / 24000
    const effectiveDriftGradient = driftGradient * occupiedHeatFactor
    const allowableRise = Math.max(0.2, maxOpenTemp - targetTemp)
    const coastMinutes = round5(clamp(allowableRise / effectiveDriftGradient * 60 - 8, 0, 75))
    const earliestSafeStopMinutes = close - coastMinutes
    const predictedOpenTemp = round1(Math.max(targetTemp - 0.2, targetTemp + (recommendedStartMinutes - latestSafeStartMinutes) / 60 * -0.12))
    const predictedCloseTemp = round1(Math.min(maxOpenTemp, targetTemp + effectiveDriftGradient * coastMinutes / 60))
    const confidence = Math.round(clamp(55 + Math.min(sampleDays, 25) * 1.1 + comfortAtOpenRate * 0.2 - (dataQuality === 'good' ? 0 : dataQuality === 'fair' ? 8 : 16), 50, 96))
    const hallPowerShare = plantPower / Math.max(halls.length, 1)
    const lateRiskMinutes = Math.round(clamp(30 * (1 + outdoorSeverity * 0.6 + attendance / 30000), 30, 50))

    return {
      no: hall.no,
      recommendedStart: minutesToTime(recommendedStartMinutes),
      recommendedStop: minutesToTime(earliestSafeStopMinutes),
      latestSafeStart: minutesToTime(latestSafeStartMinutes),
      earliestSafeStop: minutesToTime(earliestSafeStopMinutes),
      leadMinutes: open - recommendedStartMinutes,
      coastMinutes,
      predictedOpenTemp,
      predictedCloseTemp,
      earlyWasteKWh: Math.round(hallPowerShare * 0.5),
      lateRiskMinutes,
      confidence,
      evidence: `${sampleDays} 个有效样本日 · 历史降温 ${coolingGradient.toFixed(1)}℃/h · 开馆达标率 ${Math.round(comfortAtOpenRate)}%`,
      _startMinutes: recommendedStartMinutes,
      _stopMinutes: earliestSafeStopMinutes
    }
  })

  const startSchedule = hallSchedules.reduce((selected, item) => !selected || item._startMinutes < selected._startMinutes ? item : selected, null)
  const stopSchedule = hallSchedules.reduce((selected, item) => !selected || item._stopMinutes > selected._stopMinutes ? item : selected, null)
  const plantStartMinutes = startSchedule?._startMinutes ?? earliestOpen - 60
  const plantStopMinutes = stopSchedule?._stopMinutes ?? latestClose
  const preCoolingMinutes = round5(earliestOpen - plantStartMinutes)
  const plantCoastMinutes = Math.max(0, latestClose - plantStopMinutes)
  const plantConfidence = hallSchedules.length ? Math.min(...hallSchedules.map(item => item.confidence)) : 50

  // 高湿和高负荷时优先保证除湿/能力；高价时只在安全边界内适度抬高设定值。
  const priceTemperatureLift = highPrice && wetBulb < 26 ? 0.2 : 0
  const chwSupplyTemp = round1(clamp(8.8 + priceTemperatureLift - Math.max(0, wetBulb - 22) * 0.18 - Math.max(0, loadRatio - 0.65) * 1.25, 5, 9))
  const chwReturnTempTarget = round1(clamp(chwSupplyTemp + 5.5 + Math.max(0, loadRatio - 0.7) * 0.8, 10, 16))
  const chwPumpFrequency = Math.round(clamp(30 + loadRatio * 11, 30, 50))
  const cwPumpFrequency = Math.round(clamp(31 + loadRatio * 10 + Math.max(0, wetBulb - 23) * 0.8, 30, 50))
  const towerFrequency = Math.round(clamp(30 + loadRatio * 6 + Math.max(0, wetBulb - 22) * 1.1, 30, 50))
  const chillerCount = Math.round(clamp(Math.ceil(loadP90 / 3600), 1, 3))
  const expectedSavingRate = round1(clamp(7.5 + (44 - chwPumpFrequency) * 0.35 + (42 - towerFrequency) * 0.22 + plantCoastMinutes * 0.035, 4, 17))
  const estimatedPrecoolEnergy = Math.round(plantPower * Math.max(0, preCoolingMinutes) / 60)
  const estimatedSavedVsFixed = Math.round(plantPower * (Math.max(0, 120 - preCoolingMinutes) + plantCoastMinutes) / 60)
  const plantStartTime = minutesToTime(plantStartMinutes)
  const plantStopTime = minutesToTime(plantStopMinutes)
  const governingHall = `${startSchedule?.no || '-'}号馆启动 / ${stopSchedule?.no || '-'}号馆停机`

  return {
    plantStartTime,
    plantStopTime,
    preCoolingMinutes,
    hallSchedules: hallSchedules.map(({ _startMinutes, _stopMinutes, ...item }) => item),
    schedule: {
      earliestEventOpen: minutesToTime(earliestOpen),
      latestEventClose: minutesToTime(latestClose),
      recommendedStart: plantStartTime,
      recommendedStop: plantStopTime,
      governingHall,
      estimatedPrecoolEnergy,
      estimatedSavedVsFixed,
      confidence: plantConfidence
    },
    controls: { chwSupplyTemp, chwReturnTempTarget, chwPumpFrequency, cwPumpFrequency, towerFrequency, chillerCount, expectedSavingRate },
    conclusion: `最早 ${minutesToTime(earliestOpen)} 开馆是启动硬边界，${startSchedule?.no || '-'}号馆历史降温速度决定能源站 ${plantStartTime} 启动；${stopSchedule?.no || '-'}号馆余冷滑行决定 ${plantStopTime} 停机，预计可在最晚闭馆前滑行 ${plantCoastMinutes} 分钟。${highPrice ? '峰价窗口内优先调整供水温度，' : ''}泵塔与机组台数按能力矩阵执行。`
  }
}
