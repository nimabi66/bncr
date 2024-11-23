interface PluginsInfo {
  type: 'sub';
  id: string;
  name: string;
  description: string;
  author: string;
  team: string;
  version: string;
  classification: string[];
  systemVersionRange: string;
  filename: string;
  fileDir: string;
  isMod?: boolean;
  isCron: boolean;
  isService: boolean;
  isAdapter: boolean;
  isChatPlugin: boolean;
  isEncPlugin: boolean;
  isAuthentication: boolean;
}

interface PluginList {
  publicList: { [fileDir: string]: PluginsInfo };
  authenticationList: { [fileDir: string]: PluginsInfo };
}
interface UserInfo {
  bncrVersion: string;
  machineId: string;
  isDev: string;
}

/**
 * 用户打开插件市场将请求开发者的订阅链接，此请求会经过该方法
 * 你可以根据请求者的信息来制定返回插的件列表
 * @param pluginList 你所有将发布的插件信息
 * @param userInfo 用户的请求信息
 * @returns 必须将处理完的pluginList返回
 */
export async function getPluginsList(userInfo: UserInfo, pluginList: PluginList) {
  console.log('userInfo', userInfo);

  // console.log('将要发布的插件列表', pluginList);
  /* 例如当请求者不符合条件时，不向其提供认证插件 */
  if (!['123dgasd'].includes(userInfo.machineId)) {
    /* 重置认证为空列表 */
    // pluginList.authenticationList = {};
    /* 或者不提供某个插件 */
    delete pluginList.publicList['/plugins/测试组织/某插件.js'];
  }
  // console.log('返回的插件列表', pluginList);

  /* 必须返回处理完的列表 */
  return pluginList;
}

/**
 * 当用户请求一个插件时会经过该方法
 * 你可以控制是否允许下载该插件
 * @param userInfo
 * @param pluginsInfo
 * @returns 返回一个boolean值代表是否允许下载插件
 */
export async function getPluginsContent(userInfo: UserInfo, pluginsInfo: PluginsInfo) {
  /* 例如当请求者不符合条件时，不向其提供认证插件 */
  if (pluginsInfo.isAuthentication) {
    if (!['123dgasd'].includes(userInfo.machineId)) {
      // return false;
    }
  }

  /* 返回的任何值都会被!!转换成boolean */
  return true;
}
