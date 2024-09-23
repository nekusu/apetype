import { shallowEqual, useListState } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import { useStatefulRef } from './useStatefulRef';

const HUEMINT_API_URL = 'https://api.huemint.com/color';

export function useColorPalette() {
  type Data = { results: { palette: string[] }[] };
  type GenerateOptions = {
    model: 'transformer' | 'diffusion' | 'random';
    creativity: number;
    palette?: string[];
    colorCount?: number;
  };

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ model, creativity, palette, colorCount }: GenerateOptions) =>
      fetch(HUEMINT_API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          mode: model,
          temperature: creativity,
          palette,
          adjacency: [
            0, 56, 10, 5, 73, 18, 56, 0, 26, 51, 6, 15, 10, 26, 0, 9, 35, 8, 5, 51, 9, 0, 67, 16,
            73, 6, 35, 67, 0, 19, 18, 15, 8, 16, 19, 0,
          ],
          // biome-ignore lint/style/useNamingConvention: api is not camelCase
          num_colors: colorCount ?? 6,
          // biome-ignore lint/style/useNamingConvention: api is not camelCase
          num_results: 50,
        }),
      }).then((res) => res.json() as Promise<Data>),
  });
  const [palettes, paletteHandler] = useListState<string[]>([]);
  const lastUsedOptions = useStatefulRef<GenerateOptions>({
    model: 'transformer',
    creativity: 1.4,
  });

  const generate = async (options?: GenerateOptions) => {
    if (options && !shallowEqual(options, lastUsedOptions.current)) {
      paletteHandler.setState([]);
      lastUsedOptions.current = options ?? {};
    }
    try {
      const data = await mutateAsync(options ?? lastUsedOptions.current);
      if (data?.results) paletteHandler.append(...data.results.map((r) => r.palette));
    } catch (e) {
      console.error(e);
    }
  };

  return { generate, palettes, isPending, lastUsedOptions };
}
