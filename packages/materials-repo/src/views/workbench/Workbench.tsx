import * as React from 'react';
import { Fragment } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardImg,
  CardSubtitle,
  CardText,
  CardTitle,
  Col,
  Row,
} from 'reactstrap';

import img1 from '../../assets/images/users/1.jpg';
import { useGlobalContext } from '../../store';
import RecentActivities from './RecentActivities';
import { useLocation } from 'react-router';
import { resetToDefaultLayoutSettings } from '../../store/settings/actions';

type QuickStartPageProps = {
  title?: string;
};

/**
 * 个人资料库及最近动态。
 * todo 最近动态参考wps，左边日期，右边操作
 */
export function Workbench(props: QuickStartPageProps) {
  // const { title = 'Knowledge base about Rich Text Editors' } = props;

  const { pathname } = useLocation();

  const {
    state: { user, auth },
    dispatch,
  } = useGlobalContext();

  return (
    <Fragment>
      <h5 className='mb-3'>置顶资料库</h5>
      <Row>
        <Col xs='12' md='4'>
          <Card>
            <CardBody>
              <CardTitle>
                {/* <Link to='/user/ak'>Atlassian Editor Materials repo</Link> */}
                <Link to={`/${user.user.username}/ak/repo`}>
                  Atlassian Editor Materials repo
                </Link>
              </CardTitle>
              <CardText>examples and materials for Atlassian Editor.</CardText>
            </CardBody>
          </Card>
        </Col>

        <Col xs='12' md='4'>
          <Card>
            <CardBody>
              <CardTitle>
                {/* <Link to='/user/ak/wiki/ae/core/labs'> */}
                <Link to={`/pages/${user.user.username}/ak`}>
                  {/* Atlassian Editor Documentation and Tutorials */}
                </Link>
              </CardTitle>
              <CardText>
                (未实现) Documentation and Tutorials for Atlassian Editor.
              </CardText>
            </CardBody>
          </Card>
        </Col>
        <Col xs='12' md='4'>
          <Card>
            <CardBody>
              <CardTitle>
                {/* <Link to='/user/ak/wiki/ae/core/labs'> */}
                <Link to={`/${user.user.username}/ak/pages/ak-examples`}>
                  {/* Atlassian Editor Examples */}
                </Link>
              </CardTitle>
              <CardText>
                (未实现)Atlassian Editor examples from the gitlab repo.
              </CardText>
            </CardBody>
          </Card>
        </Col>
        <Col xs='12' md='4'>
          <Card>
            <CardBody>
              <CardTitle>
                <Link to={`/${user.user.username}/pm/pages/pm-eg`}>
                  {/* ProseMirror Examples */}
                </Link>
              </CardTitle>
              <CardText>
                (未实现) Some quick example text to build on the card title and
                make up the bulk of the cards content.
              </CardText>
            </CardBody>
          </Card>
        </Col>
        <Col xs='12' md='4'>
          <Card>
            <CardBody>
              <CardTitle>
                <Link to={`/${user.user.username}/pm/pages/pm-docs`}>
                  {/* ProseMirror Documentation and Tutorials */}
                </Link>
              </CardTitle>
              <CardText>
                (未实现) Some quick example text to build on the card title and
                make up the bulk of the cards content.
              </CardText>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <h5 className='mb-3'>最近动态</h5>
      <Row>
        <Col lg={12}>
          <Card>
            <CardBody>{/* <CardTitle>最近动态</CardTitle> */}</CardBody>
            <div
              className='comment-widgets scrollable'
              // style={{ height: '560px' }}
            >
              {/* <PerfectScrollbar> */}
              <RecentActivities
                image={img1}
                badge='Pending'
                badgeColor='primary'
                name='James Anderson'
                comment='Lorem Ipsum is simply dummy text of the printing and type setting industry.'
                date='April 14, 2016'
              />
              <RecentActivities
                image={img1}
                badge='Approved'
                badgeColor='success'
                name='Michael Jorden'
                comment='Lorem Ipsum is simply dummy text of the printing and type setting industry.'
                date='April 14, 2016'
              />
              <RecentActivities
                image={img1}
                badge='Rejected'
                badgeColor='danger'
                name='Johnathan Doeting'
                comment='Lorem Ipsum is simply dummy text of the printing and type setting industry.'
                date='April 14, 2016'
              />
              <RecentActivities
                image={img1}
                badge='Pending'
                badgeColor='primary'
                name='James Anderson'
                comment='Lorem Ipsum is simply dummy text of the printing and type setting industry.'
                date='April 14, 2016'
              />
              <RecentActivities
                image={img1}
                badge='Approved'
                badgeColor='success'
                name='Michael Jorden'
                comment='Lorem Ipsum is simply dummy text of the printing and type setting industry.'
                date='April 14, 2016'
              />
              {/* </PerfectScrollbar> */}
            </div>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
}

export default Workbench;
