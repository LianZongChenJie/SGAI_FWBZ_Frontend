import { defineStore } from 'pinia';
import { store } from '/@/store';
import { getAreaListAllTagApi } from '/@/api/equipmentMonitoring';

interface TagOption {
  label: string;
  value: string;
  tagId: string;
}

interface TagOptionsState {
  /** 标签下拉项缓存 */
  tagList: TagOption[];
  /** 接口加载状态 */
  loading: boolean;
  /** 是否已加载过 */
  loaded: boolean;
}

export const useTagOptionsStore = defineStore({
  id: 'tagOptions',
  state: (): TagOptionsState => ({
    tagList: [],
    loading: false,
    loaded: false,
  }),
  getters: {
    /** 获取标签下拉选项 */
    getTagOptions(state): TagOption[] {
      return state.tagList;
    },
    /** 获取加载状态 */
    getLoading(state): boolean {
      return state.loading;
    },
  },
  actions: {
    /**
     * 获取标签下拉项数据（带缓存）
     * - 如果 store 中已有数据，直接返回
     * - 否则调用接口获取并缓存
     */
    async fetchTagList(force = false): Promise<TagOption[]> {
      // 已有缓存且不强制刷新，直接返回
      if (this.loaded && !force) {
        return this.tagList;
      }

      if (this.loading) return this.tagList;

      this.loading = true;
      try {
        const res = await getAreaListAllTagApi();
        console.log('获取 标签------')
        console.log(res)
        const data = res || [];
        this.tagList = (Array.isArray(data) ? data : []).map((item: any) => ({
          label: item.districtName,
          value: item.districtName,
          tagId: item.id+''
        }));
        this.loaded = true;
        return this.tagList;
      } catch {
        this.tagList = [];
        this.loaded = true;
        return [];
      } finally {
        this.loading = false;
      }
    },
  },
});

/** 在 setup 外部使用 store */
export function useTagOptionsStoreWithOut() {
  return useTagOptionsStore(store);
}
