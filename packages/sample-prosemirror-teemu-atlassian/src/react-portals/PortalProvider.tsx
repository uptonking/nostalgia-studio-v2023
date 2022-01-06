import React from 'react';

import { PortalProviderAPI } from './PortalProviderAPI';

export type PortalProviderProps = {
  render: (
    portalProviderAPI: PortalProviderAPI,
  ) => React.ReactChild | JSX.Element | null;
};

/** 基于render props的react组件，
 * 提供this.portalProviderAPI作为数据，会传给render组件渲染。
 * 主要逻辑都由PortalProviderAPI实现。
 * componentDidUpdate中会调用this.portalProviderAPI.forceUpdate();
 */
export class PortalProvider extends React.Component<PortalProviderProps> {
  static displayName = 'PortalProvider';

  portalProviderAPI: PortalProviderAPI;

  constructor(props: PortalProviderProps) {
    super(props);
    this.portalProviderAPI = new PortalProviderAPI();
  }

  componentDidUpdate() {
    // 每次rerender后，都会更新portal中所有react组件
    this.portalProviderAPI.forceUpdate();
  }

  render() {
    return this.props.render(this.portalProviderAPI);
  }
}
