<template>
  <div class="hello" style=" height:700px;width:372px">
    <Row style="height:5%;">
        <Col span="18" ><Input v-model="busLineName" placeholder="Enter something..." style="width: 100%" /></Col>
        <Col span="6" ><Button type="primary" @click="lineSearch">Primary</Button></Col>
    </Row>
    <Row style="height:80%;">
        <div style="height:100%;width:100%" id="container" tabindex="0">
        </div>
    </Row>
    
  </div>
</template>
<script>
import AMap from 'AMap'
export default {
  data () {
    return {
      city:'',
      linesearch:{},
      busLineName:'',
      map:{}
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init: function () {
       this.map = new AMap.Map("container", {
          resizeEnable: true,
          center: [116.397428, 39.90923],
          zoom: 13
       });
      this.showCityInfo();
    }, 
    showCityInfo: function () {
        var citysearch = new AMap.CitySearch();
        //自动获取用户IP，返回当前城市
        citysearch.getLocalCity(function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
                if (result && result.city && result.bounds) {
                    var cityinfo = result.city;
                    var citybounds = result.bounds;
                    this.city = cityinfo.substring(0,cityinfo.length-1);
                    console.log(this.city);
                    //地图显示当前城市
                    this.map.setBounds(citybounds);
                }
            } else {
                this.city = 'null';
            }
        }.bind(this));
    },
    lineSearch() {
      var busLineName = this.busLineName;
      var linesearch = this.linesearch;
      var map = this.map;
       console.log(busLineName);
      if(!busLineName) return;
      //console.log(this.busLineName);
      //实例化公交线路查询类，只取回一条路线
      if(!linesearch){
          linesearch = new AMap.LineSearch({
              pageIndex: 1,
              city: this.city,
              pageSize: 1,
              extensions: 'all'
          });
      }
      linesearch.search(busLineName, function(status, result) {
          //console.log(busLineName);
           map.clearMap()
            if (status === 'complete' && result.info === 'OK') {
                this.lineSearch_Callback(result);
                //console.log(result.info);
            } else {
                alert(result);
            }
        }.bind(this));
    },
    lineSearch_Callback(data) {
        var lineArr = data.lineInfo;
        var lineNum = data.lineInfo.length;
        if (lineNum == 0) {
        } else {
            for (var i = 0; i < lineNum; i++) {
                var pathArr = lineArr[i].path;
                var stops = lineArr[i].via_stops;
                var startPot = stops[0].location;
                var endPot = stops[stops.length - 1].location;
                if (i == 0) //作为示例，只绘制一条线路
                this.drawbusLine(startPot, endPot, pathArr);
            
            }
        }
    },
    drawbusLine(startPot, endPot, BusArr) {
      var map = this.map;
        //绘制起点，终点
        new AMap.Marker({
            map: map,
            position: startPot, //基点位置
            icon: "https://webapi.amap.com/theme/v1.3/markers/n/start.png",
            zIndex: 10
        });
        new AMap.Marker({
            map: map,
            position: endPot, //基点位置
            icon: "https://webapi.amap.com/theme/v1.3/markers/n/end.png",
            zIndex: 10
        });
        //绘制乘车的路线
        busPolyline = new AMap.Polyline({
            map: map,
            path: BusArr,
            
            strokeColor: "#09f",//线颜色
            strokeOpacity: 0.8,//线透明度
            isOutline:true,
            outlineColor:'white',
            strokeWeight: 6//线宽
        });
        map.setFitView();
    }
  }
}
</script>


