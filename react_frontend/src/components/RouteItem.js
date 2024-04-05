import React from 'react';
import { Descriptions } from 'antd';
export default function RouteItem(props) {
  const items = [
    {
      key: '1',
      label: 'Estimate Time',
      children: props.routeData.details.estimateTime,
    },
    {
      key: '2',
      label: 'Ski Length',
      children: props.routeData.details.length,
    },
    {
      key: '3',
      label: 'Number of waypoints',
      children: props.routeData.locations.length - 2,
    },
    {
      key: '4',
      label: 'Number of lifts',
      children: (function countDifficultyZero(routes) {
        return routes.filter(route => route.difficulty === 0).length;
      }(props.routeData.routes)),
    },
  ];
  return (
    <Descriptions title={props.routeData.tag + " route"}
      column={1} items={items} />
  );
}
