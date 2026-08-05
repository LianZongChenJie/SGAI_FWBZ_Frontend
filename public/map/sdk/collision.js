onmessage = function (event) {
    var type = event.type;
    var data = event.data;
    if(data.type == "collision"){
        poiOcclusionQuery.collision(data);
        postMessage(poiOcclusionQuery.retValue);
    }
    if(data.type == "click"){
        var ret = poiOcclusionQuery.getObject(data["clickPoint"]["x"],data["clickPoint"]["y"]);
        postMessage({"type":"onPoiClick","data":ret});
    }


};


var Rect = {};

Rect.create = function () {
    return [0, 0, 0, 1];
};

Rect.make = function (left, top, right, bottom) {
    return [left, top, right, bottom];
};

Rect.assign = function (retVal, left, top, right, bottom) {
    retVal[0] = left;
    retVal[1] = top;
    retVal[2] = right;
    retVal[3] = bottom;
};

Rect.offset = function (retVal, x, y) {
    retVal[0] += x;
    retVal[1] += y;
    retVal[2] += x;
    retVal[3] += y;
};


Rect.expand = function (retVal, left, top, right, bottom) {
    retVal[0] -= left;
    retVal[1] -= top;
    retVal[2] += right;
    retVal[3] += bottom;
};

Rect.copy = function (retVal, rcIn) {
    retVal[0] = rcIn[0];
    retVal[1] = rcIn[1];
    retVal[2] = rcIn[2];
    retVal[3] = rcIn[3];
};

Rect.isValid = function (rect1) {
    return rect1[0] <= rect1[2] && rect1[1] <= rect1[3];
};

Rect.getWidth = function (rect1) {
    return rect1[2] - rect1[0];
};

Rect.getHeight = function (rect1) {
    return rect1[3] - rect1[1];
};


Rect.makeInvalid = function (rect1) {
    rect1[0] = 999999999;
    rect1[1] = 999999999;
    rect1[2] = -999999999;
    rect1[3] = -999999999;
};
Rect.combine = function(rectOut, rect1, rect2){
    rectOut[0] = Math.min(rect1[0], rect2[0]);
    rectOut[1] = Math.min(rect1[1], rect2[1]);
    rectOut[2] = Math.max(rect1[2], rect2[2]);
    rectOut[3] = Math.max(rect1[3], rect2[3]);
}


Rect.intersect = function (rect1, rect2) {
    return !(rect1[2] < rect2[0] || rect1[3] < rect2[1] || rect2[2] < rect1[0] || rect2[3] < rect1[1]);
};

Rect.contain = function (rect1, rect2) {
    if (rect1[0] > rect2[0] || rect1[2] < rect2[2] || rect1[1] > rect2[1] || rect1[3] < rect2[3]) return false;
    return true;
};

Rect.containPoint = function (rect1, pt) {
    if (pt[0] < rect1[0] || pt[0] > rect1[2] || pt[1] < rect1[1] || pt[1] > rect1[3]) return false;
    return true;
};


    var BUF_SIZE = 128;
    var BUF_BIT_OFFSET = 7;
var PoiOcclusionQuery = function () {
    var thisObject = this;
    thisObject.renderDevice = null;
    thisObject.buffer = null;
    thisObject.bufferRect = null;
    thisObject.indexMap = null;
    thisObject.aspectWidth = 1;
    thisObject.aspectHeight = 1;
};

function compare(a, b) {
    return a.viewDistance - b.viewDistance;
}

PoiOcclusionQuery.prototype.collision = function(renderArgs){
    this.clear();
    this.setViewport(renderArgs.view.viewWidth, renderArgs.view.viewHeight);

    var arraySize = renderArgs.list.length;
    if(arraySize === 0) return;
    // sorting
    renderArgs.list.sort(compare);
    var ro = renderArgs.list[0];
    var maxDistance = ro.viewDistance;

    var map = {};
    var filterMap = {};

    for (var ii = arraySize - 1; ii >= 0; ii--) {
        ro = renderArgs.list[ii];
        var rcWhole = ro.rect;
        var rank = ro.viewDistance;

        var testRet = this.isVisible(rcWhole, rank);
        if (testRet == true) {
            map[ro.id] = ro;
            if(ro.name ==="嘉和一品2店"){
              //  console.log(ro.name);
            }
            
            this.updateRect(ro, rcWhole, rank, rcWhole);
        }
        else {
//             if(ro.name ==="嘉和一品2店"){
//                 console.log("filtered:" + ro.name);
//             }
            filterMap[ro.id] = ro;
        }
    }
    for(var key in map){
        var ro = map[key];
        if(this._lastResultMap.hasOwnProperty(ro.id)){
//         this.retValue.showResult.push(ro);
           this.retValue.normalResult.push(ro);
        //    if(ro.name ==="嘉和一品2店"){
        //         console.log("normalResult:" + ro.name);
        //     }
        }else{
            this.retValue.showResult.push(ro);
            // if(ro.name ==="嘉和一品2店"){
            //     console.log("showResult:" + ro.name);
            // }
        }

    }

    for(var key in filterMap){
        var ro = filterMap[key];
        if(this._lastResultMap.hasOwnProperty(ro.id)){
//         this.retValue.showResult.push(ro);
           
           this.retValue.hideResult.push(ro);
        }

    }

    this._lastResultMap = map;

}


PoiOcclusionQuery.prototype.initialize = function () {
    var thisObject = this;
    thisObject.buffer = new Array(BUF_SIZE * BUF_SIZE);
    thisObject.bufferRect = Rect.make(0, 0, BUF_SIZE, BUF_SIZE);
    thisObject.indexMap = {};
    thisObject._lastResultMap = {};
    thisObject.retValue = {
            type : "collisionResult",
            hideResult : [],
            showResult : [],
            normalResult : [] 
        }


};

PoiOcclusionQuery.prototype.finalize = function () {

};

PoiOcclusionQuery.prototype.setViewport = function (cx, cy) {
    // cx/=ConfigOptions.devicePixelRatio;
    //  cy/=ConfigOptions.devicePixelRatio;
    var thisObject = this;
    thisObject.aspectWidth = Math.floor(Math.log(cx >> BUF_BIT_OFFSET) / Math.log(2.0));
    //if(cx % BUF_SIZE > 0){
    thisObject.aspectWidth += 1;
    //}

    thisObject.aspectHeight = Math.floor(Math.log(cy >> BUF_BIT_OFFSET) / Math.log(2.0));
    //if(cy % BUF_SIZE > 0){
    thisObject.aspectHeight += 1;
    // }
};

PoiOcclusionQuery.prototype.clear = function () {
    var thisObject = this;
    var totalSize = BUF_SIZE * BUF_SIZE;
    var m_buffer = thisObject.buffer;
    for (var i = 0; i < totalSize; i++) {
        m_buffer[i] = {rank:0, obj:undefined};
    }
    thisObject.indexMap = {};
    thisObject.retValue.hideResult.length = 0;
    thisObject.retValue.showResult.length = 0;
    thisObject.retValue.normalResult.length = 0;
    //memset(m_buffer, 0, BUF_SIZE*BUF_SIZE * sizeof(PoiOcclusionBuffer));
    //thisObject.indexMap.length = 0;
}

var rcCheck = Rect.create();
PoiOcclusionQuery.prototype.isVisible = function (rc, rank) {
    var thisObject = this;
    var m_buffer = thisObject.buffer;

    Rect.copy(rcCheck, rc);
    rcCheck[0] >>= thisObject.aspectWidth;
    rcCheck[1] >>= thisObject.aspectHeight;
    rcCheck[2] >>= thisObject.aspectWidth;
    rcCheck[3] >>= thisObject.aspectHeight;

    if (!Rect.contain(thisObject.bufferRect, rcCheck))
        return false;

    var horizontal_index = rcCheck[0] - thisObject.bufferRect[0];
    var vertical_index = rcCheck[1] - thisObject.bufferRect[1];
    var buffer_width = Rect.getWidth(thisObject.bufferRect);

    var check_width, check_height;
    check_width = Rect.getWidth(rcCheck);
    check_height = Rect.getHeight(rcCheck);

    for (var ni = 0; ni < check_height; ni++) {
        var n = horizontal_index + ( vertical_index + ni ) * buffer_width;

        for (var nj = 0; nj < check_width; nj++) {
            var dot = nj + n;
            if (rank < m_buffer[dot].rank)
                return false;
        }
    }

    return true;
};


PoiOcclusionQuery.prototype.testRect = function (rc) {
    var thisObject = this;
    Rect.copy(rcCheck, rc);
    rcCheck[0] >>= thisObject.aspectWidth;
    rcCheck[1] >>= thisObject.aspectHeight;
    rcCheck[2] >>= thisObject.aspectWidth;
    rcCheck[3] >>= thisObject.aspectHeight;

    if (!Rect.contain(thisObject.bufferRect, rcCheck))
        return false;
    return true;
};

PoiOcclusionQuery.prototype.updateRect = function (obj, rcTest, rank, rcHot) {
    var thisObject = this;
    var m_aspect_width = thisObject.aspectWidth;
    var m_aspect_height = thisObject.aspectHeight;
    var m_buffer_rect = thisObject.bufferRect;
    var m_buffer = thisObject.buffer;
    var rcTest_left = rcTest[0], rcTest_top = rcTest[1], rcTest_right = rcTest[2], rcTest_bottom = rcTest[3];
    var rcHot_left = rcHot[0], rcHot_top = rcHot[1], rcHot_right = rcHot[2], rcHot_bottom = rcHot[3];
    var m_buffer_rect_left = m_buffer_rect[0], m_buffer_rect_top = m_buffer_rect[1], m_buffer_rect_right = m_buffer_rect[2], m_buffer_rect_bottom = m_buffer_rect[3];
    rcTest_left >>= m_aspect_width;
    rcTest_top >>= m_aspect_height;
    rcTest_right >>= m_aspect_width;
    rcTest_bottom >>= m_aspect_height;
    rcTest_bottom += 1;
    rcTest_right += 1;

    rcHot_left >>= m_aspect_width;
    rcHot_top >>= m_aspect_height;
    rcHot_right >>= m_aspect_width;
    rcHot_bottom >>= m_aspect_height;
    rcHot_bottom += 1;
    rcHot_right += 1;

    if (rcTest_left < m_buffer_rect_left)
        rcTest_left = m_buffer_rect_left;
    if (rcTest_right > m_buffer_rect_right)
        rcTest_right = m_buffer_rect_right;
    if (rcTest_bottom > m_buffer_rect_bottom)
        rcTest_bottom = m_buffer_rect_bottom;
    if (rcTest_top < m_buffer_rect_top)
        rcTest_top = m_buffer_rect_top;

    if (!(rcTest_left <= rcTest_right && rcTest_top <= rcTest_bottom))
        return false;

    if (rcHot_left < m_buffer_rect_left)
        rcHot_left = m_buffer_rect_left;
    if (rcHot_right > m_buffer_rect_right)
        rcHot_right = m_buffer_rect_right;
    if (rcHot_bottom > m_buffer_rect_bottom)
        rcHot_bottom = m_buffer_rect_bottom;
    if (rcHot_top < m_buffer_rect_top)
        rcHot_top = m_buffer_rect_top;

    if (!(rcHot_left <= rcHot_right && rcHot_top <= rcHot_bottom))
        return false;

    var test_x = rcTest_left - m_buffer_rect_left;
    var test_y = rcTest_top - m_buffer_rect_top;
    var buffer_width = m_buffer_rect_right - m_buffer_rect_left;

    var hot_x = rcHot_left - m_buffer_rect_left;
    var hot_y = rcHot_top - m_buffer_rect_top;

    var test_width, test_height;
    test_width = rcTest_right - rcTest_left;
    test_height = rcTest_bottom - rcTest_top;

    for (var ni = 0; ni < test_height; ni++) {
        for (var nj = 0; nj < test_width; nj++) {
            var pos_x = test_x + nj;
            var pos_y = test_y + ni;
            var dot = pos_x + pos_y * buffer_width;

            m_buffer[dot].rank = rank;
            m_buffer[dot].obj = obj;

            /*
             if ( pos_x >= rcHot_left && pos_x <= rcHot_right &&
             pos_y >= rcHot_top  && pos_y <= rcHot_bottom)
             {
             m_buffer[dot].m_hot = true;
             }
             else m_buffer[dot].m_hot = false;
             */

        }
    }

    //thisObject.indexMap[rank] = obj;
    return true;
};

PoiOcclusionQuery.prototype.getObject = function (x, y) {
    var thisObject = this;
    var m_buffer_rect = thisObject.bufferRect;
    var m_buffer = thisObject.buffer;
    var m_aspect_width = thisObject.aspectWidth;
    var m_aspect_height = thisObject.aspectHeight;

    var horizontal_index, vertical_index;
    horizontal_index = x >> thisObject.aspectWidth;
    vertical_index = y >> thisObject.aspectHeight;

    if (horizontal_index < 0 || horizontal_index >= BUF_SIZE ||
        vertical_index < 0 || vertical_index >= BUF_SIZE)
        return null;

    var dot = (horizontal_index - m_buffer_rect[0]) + (vertical_index - m_buffer_rect[1]) * Rect.getWidth(m_buffer_rect);

    if (m_buffer[dot] && m_buffer[dot].rank !== 0) {
        // var indexMap = thisObject.indexMap;
        // var itr = indexMap[m_buffer[dot]];
        var itr = m_buffer[dot].obj;
        if (itr !== undefined) {
            // retObj = itr;
            return itr;
        }
    }
    return null;
};

var poiOcclusionQuery = new PoiOcclusionQuery();
poiOcclusionQuery.initialize();