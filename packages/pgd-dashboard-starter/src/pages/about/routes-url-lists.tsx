import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Collapse,
  Row,
  UncontrolledCollapse,
} from 'reactstrap';

type RoutesUrlListsProps = {
  /** 会显示在内容区顶部的标题 */
  title?: string;
  /** title标题下的描述 */
  pageDescJsx?: React.ReactNode;
  /** 可以在其他地方灵活使用的react jsx */
  passJsx?: React.ReactNode;

  [propName: string]: any;
};

type cardUrlItem = {
  to?: string;
  text?: string;
};

/**
 * 手动编辑数据形成的系统元信息组件，列出本系统中大多数url，方便查找和测试。
 */
export function RoutesUrlLists(props: RoutesUrlListsProps) {
  const {
    title,
    pageDescJsx,
    passJsx = (
      <div>
        <p>
          open <NavLink to='/'>home page</NavLink>.
        </p>
        <p>
          open <NavLink to='/dashboard/'>dashboard/</NavLink>.
        </p>
      </div>
    ),
  }: RoutesUrlListsProps = props;

  const [isFirstCardOpen, toggleFirstCard] = useState(true);
  const handleToggleFirstCard = useCallback(
    () => toggleFirstCard((prev) => !prev),
    [],
  );
  // console.log(';;isFirstCardOpen, ', isFirstCardOpen);

  // 第1组第1张卡片数据
  const card11thUrls: cardUrlItem[] = useMemo(
    () => [
      { to: '/', text: 'root page  /' },
      { to: '/dashboard' },
      { to: '/dashboard/' },
      { to: '/dashboard/404' },
      { to: '/dashboard/abc' },
    ],
    [],
  );
  const card12thUrls: cardUrlItem[] = useMemo(
    () => [
      { to: '/dashboard/basic' },
      { to: '/dashboard/analysis' },
      { to: '/dashboard/monitor' },
      { to: '/dashboard/404' },
      { to: '/dashboard/abc' },
    ],
    [],
  );

  // 第2组第1张卡片数据
  const card21thUrls: cardUrlItem[] = useMemo(
    () => [
      { to: '/login', text: '/login' },
      { to: '/register' },
      { to: '/pwd' },
      { to: '/landing' },
      { to: '/404public' },
    ],
    [],
  );
  const card22thUrls: cardUrlItem[] = useMemo(
    () => [
      { to: '/dashboard/basic' },
      { to: '/dashboard/analysis' },
      { to: '/dashboard/monitor' },
      { to: '/dashboard/404' },
      { to: '/dashboard/abc' },
      { to: '/dashboard/list' },
      { to: '/dashboard/form' },
      { to: '/dashboard/exception' },
      { to: '/dashboard/exception/404' },
    ],
    [],
  );

  // 第3组第1张卡片数据
  const card31thUrls: cardUrlItem[] = useMemo(
    () => [
      { to: '/', text: 'card 31  /' },
      { to: '/dashboard' },
      { to: '/dashboard/' },
      { to: '/dashboard/404' },
      { to: '/dashboard/abc' },
    ],
    [],
  );

  const memoedResultJsx = useMemo(
    () => (
      <div>
        <Card>
          <CardBody>
            <div>
              <h3 className='mb-3'>{title ?? 'Routing URL Lists Page'}</h3>
              <p>{pageDescJsx}</p>
            </div>

            <Row>
              <Col xs='12' md='4'>
                <Card>
                  <CardTitle className='bg-light border-bottom p-1 mb-0'>
                    <Button
                      onClick={handleToggleFirstCard}
                      className='btn btn-light'
                      style={{ boxShadow: 'none', fontSize: 18 }}
                    >
                      common urls
                    </Button>
                  </CardTitle>
                  <CardBody className=''>
                    <Collapse isOpen={isFirstCardOpen}>
                      <Card className='shadow-none'>
                        <CardBody>
                          {card11thUrls.map(({ to, text }, idx) => (
                            <p key={idx}>
                              <NavLink to={to}>{text ?? to}</NavLink>
                            </p>
                          ))}
                        </CardBody>
                      </Card>
                    </Collapse>
                  </CardBody>
                </Card>
              </Col>

              <Col xs='12' md='4'>
                <Card>
                  <CardTitle className='bg-light border-bottom p-1 mb-0'>
                    <Button
                      id='toggler12'
                      className='btn btn-light'
                      style={{ boxShadow: 'none', fontSize: 18 }}
                    >
                      testing now
                    </Button>
                  </CardTitle>
                  <CardBody className=''>
                    <UncontrolledCollapse defaultOpen toggler='#toggler12'>
                      <Card className='shadow-none'>
                        <CardBody>
                          {card12thUrls.map(({ to, text }, idx) => (
                            <p key={idx}>
                              <NavLink to={to}>{text ?? to}</NavLink>
                            </p>
                          ))}
                        </CardBody>
                      </Card>
                    </UncontrolledCollapse>
                  </CardBody>
                </Card>
              </Col>

              <Col xs='12' md='4'>
                <Card>
                  <CardTitle className='bg-light border-bottom p-1 mb-0'>
                    <Button
                      id='toggler13'
                      className='btn btn-light'
                      style={{ boxShadow: 'none', fontSize: 18 }}
                    >
                      recent urls
                    </Button>
                  </CardTitle>
                  <CardBody className=''>
                    <UncontrolledCollapse defaultOpen toggler='#toggler13'>
                      <Card className='shadow-none'>
                        <CardBody>{passJsx}</CardBody>
                      </Card>
                    </UncontrolledCollapse>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <h3>more urls</h3>
            <Row>
              <Col xs='12' md='4'>
                <Card>
                  <CardTitle className='bg-light border-bottom p-1 mb-0'>
                    <Button
                      id='toggler21'
                      className='btn btn-light'
                      style={{ boxShadow: 'none', fontSize: 18 }}
                    >
                      public urls - auth/rbac
                    </Button>
                  </CardTitle>
                  <CardBody className=''>
                    <UncontrolledCollapse defaultOpen toggler='#toggler21'>
                      <Card className='shadow-none'>
                        <CardBody>
                          {card21thUrls.map(({ to, text }, idx) => (
                            <p key={idx}>
                              <NavLink to={to}>{text ?? to}</NavLink>
                            </p>
                          ))}
                        </CardBody>
                      </Card>
                    </UncontrolledCollapse>
                  </CardBody>
                </Card>
              </Col>
              <Col xs='12' md='4'>
                <Card>
                  <CardTitle className='bg-light border-bottom p-1 mb-0'>
                    <Button
                      id='toggler22'
                      className='btn btn-light'
                      style={{ boxShadow: 'none', fontSize: 18 }}
                    >
                      dashboard urls - 1st level
                    </Button>
                  </CardTitle>
                  <CardBody className=''>
                    <UncontrolledCollapse defaultOpen toggler='#toggler22'>
                      <Card className='shadow-none'>
                        <CardBody>
                          {card22thUrls.map(({ to, text }, idx) => (
                            <p key={idx}>
                              <NavLink to={to}>{text ?? to}</NavLink>
                            </p>
                          ))}
                        </CardBody>
                      </Card>
                    </UncontrolledCollapse>
                  </CardBody>
                </Card>{' '}
              </Col>
              <Col xs='12' md='4'>
                <Card>
                  <CardTitle className='bg-light border-bottom p-1 mb-0'>
                    <Button
                      id='toggler23'
                      className='btn btn-light'
                      style={{ boxShadow: 'none', fontSize: 18 }}
                    >
                      testing now
                    </Button>
                  </CardTitle>
                  <CardBody className=''>
                    <UncontrolledCollapse defaultOpen toggler='#toggler23'>
                      <Card className='shadow-none'>
                        <CardBody>
                          <p>
                            <NavLink to=''>测点什么</NavLink>
                          </p>
                          <p>
                            <NavLink to=''>测点什么</NavLink>
                          </p>
                        </CardBody>
                      </Card>
                    </UncontrolledCollapse>
                  </CardBody>
                </Card>
              </Col>

              <Col xs='12' md='6'>
                <Card>
                  <CardTitle className='bg-light border-bottom p-1 mb-0'>
                    <Button
                      id='toggler24'
                      className='btn btn-light'
                      style={{ boxShadow: 'none', fontSize: 18 }}
                    >
                      testing now
                    </Button>
                  </CardTitle>
                  <CardBody className=''>
                    <UncontrolledCollapse defaultOpen toggler='#toggler24'>
                      <Card className='shadow-none'>
                        <CardBody>
                          <p>
                            <NavLink to=''>测点什么</NavLink>
                          </p>
                          <p>
                            <NavLink to=''>测点什么</NavLink>
                          </p>
                        </CardBody>
                      </Card>
                    </UncontrolledCollapse>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <h3>more testing</h3>
            <Row>
              <Col xs='12' md='4'>
                <Card>
                  <CardTitle className='bg-light border-bottom p-1 mb-0'>
                    <Button
                      id='toggler31'
                      className='btn btn-light'
                      style={{ boxShadow: 'none', fontSize: 18 }}
                    >
                      testing now
                    </Button>
                  </CardTitle>
                  <CardBody className=''>
                    <UncontrolledCollapse defaultOpen toggler='#toggler31'>
                      <Card className='shadow-none'>
                        <CardBody>
                          {card31thUrls.map(({ to, text }, idx) => (
                            <p key={idx}>
                              <NavLink to={to}>{text ?? to}</NavLink>
                            </p>
                          ))}
                        </CardBody>
                      </Card>
                    </UncontrolledCollapse>
                  </CardBody>
                </Card>
              </Col>
              <Col xs='12' md='4'>
                <Card>
                  <CardTitle className='bg-light border-bottom p-1 mb-0'>
                    <Button
                      id='toggler32'
                      className='btn btn-light'
                      style={{ boxShadow: 'none', fontSize: 18 }}
                    >
                      testing now
                    </Button>
                  </CardTitle>
                  <CardBody className=''>
                    <UncontrolledCollapse defaultOpen toggler='#toggler32'>
                      <Card className='shadow-none'>
                        <CardBody>
                          <p>
                            <NavLink to=''>测点什么</NavLink>
                          </p>
                          <p>
                            <NavLink to=''>测点什么</NavLink>
                          </p>
                        </CardBody>
                      </Card>
                    </UncontrolledCollapse>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    ),
    [
      card11thUrls,
      card12thUrls,
      card21thUrls,
      card22thUrls,
      card31thUrls,
      handleToggleFirstCard,
      isFirstCardOpen,
      pageDescJsx,
      passJsx,
      title,
    ],
  );

  return memoedResultJsx;
}

export default RoutesUrlLists;
// export default memo(RoutesUrlLists);
