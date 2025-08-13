/*
 * @Author: Sid Li
 * @Date: 2025-08-08 10:28:51
 * @LastEditors: Sid Li
 * @LastEditTime: 2025-08-13 13:34:42
 * @FilePath: \pic-demo-git\pic-demo\src\api\common.js
 * @Description:
 */
import request from "@/utils/request.js";

//token获取
export function steps() {
  return request({
    url: "/FreeIeAPI/get_process_steps",
    method: "get",
  });
}

export function fetchImage() {
  return request({
    url: "/FreeIeAPI/get_fetch_image",
    method: "get",
  });
}

export function processImage(data) {
  return request({
    url: "FreeIeAPI/process_image",
    method: "post",
    data,
  });
}
