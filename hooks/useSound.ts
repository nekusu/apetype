import { getRandomNumber } from '@/utils/misc';
import type { Sound } from '@/utils/settings';
import { useDidUpdate } from '@mantine/hooks';
import { Earwurm, type ManagerConfig, type StackState } from 'earwurm';
import { useCallback, useEffect, useRef, useState } from 'react';

const SOUNDS: Record<Sound, number> = {
  beep: 3,
  click: 3,
  hitmarker: 3,
  'nk-creams': 6,
  osu: 3,
  pop: 3,
  typewriter: 3,
};
const soundStacks = Object.entries(SOUNDS).reduce(
  (stacks, [sound, count]) => {
    stacks[sound as Sound] = Array(count)
      .fill(0)
      .map((_, index) => ({
        id: index.toString(),
        path: `/sound/${sound}/${index + 1}.webm`,
      }));
    return stacks;
  },
  {} as Record<Sound, { id: string; path: string }[]>,
);

export function useSound(sound?: false | Sound | `${string}.webm`, config: ManagerConfig = {}) {
  const manager = useRef<Earwurm>();
  const [state, setState] = useState<StackState>();

  const play = useCallback(() => {
    if (!manager.current) return;
    const keysLength = manager.current.keys.length;
    const index = keysLength > 1 ? getRandomNumber(keysLength - 1) : 0;
    const stack = manager.current.get(manager.current.keys[index]);
    stack?.on('state', setState);
    stack?.prepare().then((sound) => sound.play());
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: not needed
  useEffect(() => {
    if (sound) {
      manager.current = new Earwurm({
        ...config,
        request: { cache: 'force-cache', ...config.request },
      });
      manager.current.unlock();
      if (sound in SOUNDS) manager.current.add(...soundStacks[sound as Sound]);
      else manager.current.add({ id: sound, path: `/sound/${sound}` });
    }
    return () => {
      manager.current?.teardown();
    };
  }, [sound]);
  useDidUpdate(() => {
    if (manager.current && config.volume) manager.current.volume = config.volume;
  }, [config.volume]);

  return { play, state };
}
