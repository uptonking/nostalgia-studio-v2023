import React, { CSSProperties } from 'react';
import { Typography, Space } from 'antd';

const KeyValue: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography.Text>{label}</Typography.Text>
    <Typography.Text keyboard>{value}</Typography.Text>
  </Space>
);

export default function KeyboardGuide({ style }: { style?: CSSProperties }) {
  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      <KeyValue label='Create note from list' value='c' />
      <KeyValue label='Delete note in list' value='e' />
      <KeyValue label='Select note in list' value='x' />
      <KeyValue label='Browse next note in list' value='j' />
      <KeyValue label='Browse previous note in list' value='k' />
      <KeyValue label='Search notes in list' value='/' />
      <KeyValue label='Browse next note from note view' value='ctrl+j' />
      <KeyValue label='Browse previous note from note view' value='ctrl+k' />
      <KeyValue label='Make right pane wider' value='shift+ctrl+h' />
      <KeyValue label='Make right pane narrower' value='shift+ctrl+l' />
      <KeyValue label='Start editing note from list' value='enter' />
      <KeyValue label='Go backwards' value='escape' />
      <KeyValue label='Command palette' value='cmd/ctrl+k' />
      <KeyValue label='Show all shortcuts' value='?' />
    </Space>
  );
}
