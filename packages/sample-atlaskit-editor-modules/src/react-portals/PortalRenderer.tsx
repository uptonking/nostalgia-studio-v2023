import React from 'react';
import { createPortal } from 'react-dom';

import { PortalProviderAPI } from './PortalProviderAPI';

export type Portals = Map<HTMLElement, React.ReactChild>;

interface IProps {
  portalProviderAPI: PortalProviderAPI;
}
interface IState {
  portals: Portals;
}

export class PortalRenderer extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    props.portalProviderAPI.setContext(this);

    // ？ 只有注册，没有找到执行
    props.portalProviderAPI.on('update', this.handleUpdate);
    this.state = { portals: new Map() };
  }

  /** 强制更新本组件，会更新portal中所有react元素 */
  handleUpdate = (portals: Portals) => this.setState({ portals });

  render() {
    const { portals } = this.state;
    return (
      <>
        {Array.from(portals.entries()).map(([container, children]) =>
          createPortal(children, container),
        )}
      </>
    );
  }
}
