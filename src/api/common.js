import request from "@/utils/request.js";

//token获取
export function login() {
  return request({
    url: "FreeIeAPI/Login",
    method: "get",
  });
}

//获取网络的状态信息
export function netWork() {
  return request({
    url: "FreeIeAPI/Network",
    method: "get",
  });
}

//授权码
export function codeVerify(code) {
  return request({
    url: `FreeIeAPI/Verify/${code}`,
    method: "get",
  });
}

//连接对应网络
export function connectNetwork(data) {
  return request({
    url: "FreeIeAPI/Network",
    method: "post",
    data,
  });
}

// 获取wifi信息
export function wifiList(params) {
  return request({
    url: "FreeIeAPI/WIFI",
    method: "get",
    params,
  });
}

export function connectWifi(data) {
  return request({
    url: "FreeIeAPI/WIFI",
    method: "post",
    data,
  });
}

export function currentInfo() {
  return request({
    url: "FreeIeAPI/WIFI/Current",
    method: "get",
  });
}
//远程维护
export function localMapping() {
  return request({
    url: "FreeIeAPI/LocalMapping",
    method: "get",
  });
}

//上传
export function logUpload() {
  return request({
    url: "FreeIeAPI/LogUpload",
    method: "get",
  });
}

//服务器连接状态
export function serverConnection() {
  return request({
    url: "FreeIeAPI/ServerConnection",
    method: "get",
  });
}

//系统升级
export function systemUpdate() {
  return request({
    url: "FreeIeAPI/SystemUpdate",
    method: "get",
  });
}

//数据库同步
export function databaseUpdate() {
  return request({
    url: "FreeIeAPI/DatabaseUpdate",
    method: "get",
  });
}

//添加 连接测试
export function testPing(url) {
  return request({
    url: `FreeIeAPI/Ping/${url}`,
    method: "get",
  });
}

//添加 连接
export function deviceConnection(url) {
  return request({
    url: `FreeIeAPI/DeviceConnection/${url}`,
    method: "get",
  });
}

//添加 添加 废弃
// export function equipmentAdd(data) {
//   return request({
//     url: "FreeIeAPI/Equipment",
//     method: "post",
//     data,
//   });
// }

//第二版添加设备 修改设备
export function equipmentAdd(data) {
  return request({
    url: "FreeIeAPI/Equipment",
    method: "post",
    data,
  });
}

//多个添加 连接测试
export function batchConnection(urlStart, urlEnd) {
  return request({
    url: `FreeIeAPI/BatchConnection/${urlStart}/${urlEnd}`,
    method: "get",
  });
}

//调试 开启远程端口
export function portMapping() {
  return request({
    url: "FreeIeAPI/PortMapping",
    method: "get",
  });
}

export function writeAllValue(data) {
  return request({
    url: "FreeIeAPI/WriteAllValue",
    method: "post",
    data,
  });
}

//标定 点动切换 编辑按钮
export function equipmentMode(id, type) {
  return request({
    url: `FreeIeAPI/EquipmentMode/${id}/${type}`,
    method: "get",
  });
}

// 标定 标定按钮
export function calibration(robotId, positionId) {
  return request({
    url: `FreeIeAPI/Calibration/${robotId}/${positionId}`,
    method: "get",
  });
}

//标定 获取实时位置
export function fetchBit(robotId, positionId, point) {
  return request({
    url: `FreeIeAPI/FetchBit/${robotId}/${positionId}/${point}`,
    method: "get",
  });
}

//抓取点 获取实时位置
export function graspingPoint(robotId) {
  return request({
    url: `FreeIeAPI/GraspingPoint/${robotId}`,
    method: "get",
  });
}

//抓取点标定 运动到该点
export function moveBit(data) {
  return request({
    url: "FreeIeAPI/MoveBit",
    method: "put",
    data,
  });
}
//设备列表 废弃
// export function equipmentsList() {
//   return request({
//     url: "FreeIeAPI/Equipments",
//     method: "get",
//   });
// }

//第二版设备列表
export function equipmentsList() {
  return request({
    url: "FreeIeAPI/Equipment",
    method: "get",
  });
}

//设备信息
export function equipmentsInfo(id) {
  return request({
    url: `FreeIeAPI/Equipment/${id}`,
    method: "get",
  });
}

//normal
//增加工件
export function workpieceAddAndUpdate(data) {
  return request({
    url: "FreeIeAPI/Workpiece",
    method: "post",
    data,
  });
}
export function workpieceDelete(id) {
  return request({
    url: `FreeIeAPI/Workpiece/${id}`,
    method: "delete",
  });
}

export function workpieceList() {
  return request({
    url: "FreeIeAPI/Workpiece",
    method: "get",
  });
}

// export function workpieceUpdate(id, data) {
//   return request({
//     url: `FreeIeAPI/Workpiece/${id}`,
//     method: "put",
//     data,
//   });
// }

//增加托盘
export function palletAddAndUpdate(data) {
  return request({
    url: "FreeIeAPI/Pallet",
    method: "post",
    data,
  });
}

export function palletDelete(id) {
  return request({
    url: `FreeIeAPI/Pallet/${id}`,
    method: "delete",
  });
}

//托盘列表
export function palletList() {
  return request({
    url: "FreeIeAPI/Pallet",
    method: "get",
  });
}

// export function palletUpdate(id, data) {
//   return request({
//     url: `FreeIeAPI/Pallet/${id}`,
//     method: "put",
//     data,
//   });
// }

//增加隔板
export function diaphragmAddAndUpdate(data) {
  return request({
    url: "FreeIeAPI/Diaphragm",
    method: "post",
    data,
  });
}

export function diaphragmDelete(id) {
  return request({
    url: `FreeIeAPI/Diaphragm/${id}`,
    method: "delete",
  });
}

//隔板列表
export function diaphragmList() {
  return request({
    url: "FreeIeAPI/Diaphragm",
    method: "get",
  });
}

//更新隔板
// export function diaphragmUpdate(id, data) {
//   return request({
//     url: `FreeIeAPI/Diaphragm/${id}`,
//     method: "put",
//     data,
//   });
// }

//读取数据 废弃，改为post /FreeIeAPI/ReadValue/{设备ID}/{变量名称}/{数据类型}
// export function readData(id, longName, type) {
//   return request({
//     url: `FreeIeAPI/ReadValue/${id}/${longName}/${type}`,
//     method: "get",
//   });
// }

//读取数据 第二版
// {
//   "id": "680069ce3e50b96cc8b92957",
//   "bufferAreaItemName":"Start",
//   "type": 0
// }
export function readData(data) {
  return request({
    url: `FreeIeAPI/ReadValue`,
    method: "post",
    data,
  });
}

//写入下发
export function writeData(data) {
  return request({
    url: "FreeIeAPI/WriteValue",
    method: "post",
    data,
  });
}

export function writeWorkCoordinates(data) {
  return request({
    url: "FreeIeAPI/WriteWorkCoordinates",
    method: "put",
    data,
  });
}

// 增加码垛模型
//废弃
// export function addPallet(data) {
//   return request({
//     url: "FreeIeAPI/Palletizing",
//     method: "post",
//     data,
//   });
// }

// 第二版添加码垛
export function addPallet(data) {
  return request({
    url: "FreeIeAPI/SingleStacking",
    method: "post",
    data,
  });
}

//删除码垛模型 废弃
// export function deletePallet(id) {
//   return request({
//     url: `FreeIeAPI/Palletizing/${id}`,
//     method: "delete",
//   });
// }

//第二版删除
export function deletePallet(id) {
  return request({
    url: `FreeIeAPI/SingleStacking/${id}`,
    method: "delete",
  });
}

//更新码垛数据
export function updatePallet(id, data) {
  return request({
    url: `FreeIeAPI/Palletizing/${id}`,
    method: "put",
    data,
  });
}

//查看码垛数据
export function getPallet(id) {
  return request({
    url: `FreeIeAPI/Palletizing/${id}`,
    method: "get",
  });
}

//获取码垛列表
export function getPalletList() {
  return request({
    url: "FreeIeAPI/Palletizing",
    method: "get",
  });
}

//按条件查询码垛列表 /FreeIeAPI/Palletizing/{工件ID}/{底盘ID}/{隔板ID}
//废弃
// export function palletListByValue(WorkpieceId, PalletId, DiaphragmId) {
//   return request({
//     url: `FreeIeAPI/Palletizing/${WorkpieceId}/${PalletId}/${DiaphragmId}`,
//     method: "get",
//   });
// }

//第二版本查询码垛列表 条件查询
// {
//   "workpieceId": "67fdb17a6524136abe315044",
//   "palletId": "67fdb1866524136abe315044",
//   "diaphragmId": "",
//   "Interlace": false
// }
export function palletListByValue(data) {
  return request({
    url: `FreeIeAPI/Stacking`,
    method: "post",
    data,
  });
}

//单层码垛下发数据 /FreeIeAPI/WriteWorkCoordinates/设备ID/层数/码垛包ID

//奇偶码垛下发数据/FreeIeAPI/WriteWorkCoordinates/{设备ID}/{层数}/{奇数层码垛ID}/{偶数层码垛ID}
export function writeWorkCoordinatesUser(params) {
  let url;
  if (params.palletId) {
    //one
    url = `FreeIeAPI/WriteWorkCoordinates/${params.id}/${params.num}/${params.palletId}`;
  } else {
    //odd even
    url = `FreeIeAPI/WriteWorkCoordinates/${params.id}/${params.num}/${params.oddPalletId}/${params.evenPalletId}`;
  }
  return request({
    url: url,
    method: "put",
  });
}

//第二版 交错层 层叠设置 增加模板
// {
//   "id": "67fdb1d86524136abe315047",
//   "workpieceId": "67fdb17a6524136abe315043",
//   "palletId": "67fdb1866524136abe315044",
//   "diaphragmId": "",
//   "name": "xiugai",
//   "oddWorkCount": 3,
//   "oddStackingId": "67fdb1ac6524136abe315046",
//   "evenWorkCount": 3,
//   "evenStackingId": "67fdb1ac6524136abe315046",
//   "revealList": "[{\"id\": 1,\"oldCenterX\": 70, \"oldCenterY\": 100,\"xpOld\": 14}, {\"id\": 1, \"oldCenterX\": 80,   \"oldCenterY\": 110, \"xpOld\": 15 }, {\"id\": 1,\"oldCenterX\": 80,\"oldCenterY\": 110,\"xpOld\": 15}]"
// }
export function doubleStacking(data) {
  return request({
    url: `FreeIeAPI/DoubleStacking`,
    method: "post",
    data,
  });
}

//第二版 交错层 层叠设置 查询模板
export function doubleStackingList() {
  return request({
    url: `FreeIeAPI/DoubleStacking`,
    method: "get",
  });
}

//第二版 交错层 层叠设置 删除模板
export function deleteDoubleStacking(id) {
  return request({
    url: `FreeIeAPI/DoubleStacking/${id}`,
    method: "delete",
  });
}

//第二版 详情里面 写入码垛
// {
//   "id": "67ff6b07684fe4d4ab84b4bb",
//   "stackingId": "67fdb1d86524136abe315047",
//   "layer": "5",
//   "interlace":true,
//   "double": false
// }
export function writeStacking(data) {
  return request({
    url: `FreeIeAPI/WriteStacking`,
    method: "post",
    data,
  });
}

//第二版，运动到新api
export function fetchBitMove(robotId, positionId, point) {
  return request({
    url: `FreeIeAPI/FetchBitMove/${robotId}/${positionId}/${point}`,
    method: "get",
  });
}

// ==========================================================================

export function editUser(n) {
  return request({
    url: "/api/user",
    method: "put",
    data: n,
  });
}

export function removerUser(n) {
  return request({
    url: "/system/user/" + n,
    method: "DELETE",
  });
}
