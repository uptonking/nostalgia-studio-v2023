import { useMemo } from 'react';

import {
  type SensorActivatorFunction,
  type SensorDescriptor,
} from '../../sensors';
import {
  type SyntheticListener,
  type SyntheticListeners,
} from './useSyntheticListeners';

/** collect sensors.activators */
export function useCombineActivators(
  sensors: SensorDescriptor<any>[],
  getSyntheticHandler: (
    handler: SensorActivatorFunction<any>,
    sensor: SensorDescriptor<any>,
  ) => SyntheticListener['handler'],
): SyntheticListeners {
  return useMemo(
    () =>
      sensors.reduce<SyntheticListeners>((accumulator, sensor) => {
        const { sensor: currSensor } = sensor;
        const sensorActivators = currSensor.activators.map((activator) => ({
          eventName: activator.eventName,
          handler: getSyntheticHandler(activator.handler, sensor),
        }));
        return [...accumulator, ...sensorActivators];
      }, []),
    [sensors, getSyntheticHandler],
  );
}
