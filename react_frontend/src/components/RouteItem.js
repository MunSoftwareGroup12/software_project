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
      label: 'Route Condition',
      children: props.routeData.details.condition,
    },
    {
      key: '3',
      label: 'Total Length',
      children: props.routeData.details.length,
    },
    {
      key: '4',
      label: 'Number of path nodes',
      children: props.routeData.locations.length,
    },
    {
      key: '5',
      label: 'Number of route segements',
      children: props.routeData.routes.length,
    },
  ];
  return (
    <Descriptions title={props.routeData.tag + " route"}
      column={1} items={items} />

  );
}
