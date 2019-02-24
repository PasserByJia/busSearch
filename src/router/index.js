import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import LineDetails from '@/components/LineDetails'
import LineTransfer from '@/components/LineTransfer'
import TransferList from '@/components/TransferList'
import Qrcode from '@/components/Qrcode'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/LineDetails',
      name: 'LineDetails',
      component: LineDetails
    },
    {
      path: '/LineTransfer',
      name: 'LineTransfer',
      component: LineTransfer
    },
    {
      path: '/TransferList',
      name: 'TransferList',
      component: TransferList
    },
    {
      path: '/Qrcode',
      name: 'Qrcode',
      component: Qrcode
    }
  ]
})
