export interface ColorScheme {
  name: string;
  value: string;
  gradient: string;
  border: string;
  bg: string;
  text: string;
}

export const nodeColorSchemes: ColorScheme[] = [
  {
    name: 'Alic.ia',
    value: 'alicia',
    gradient: 'from-[hsl(155,85%,45%)] to-[hsl(155,85%,60%)]',
    border: 'border-[hsl(155,85%,60%)]',
    bg: 'bg-[hsl(155,85%,45%)]/10',
    text: 'text-white',
  },
  {
    name: 'Azul Tech',
    value: 'tech-blue',
    gradient: 'from-[hsl(208,95%,52%)] to-[hsl(208,95%,62%)]',
    border: 'border-[hsl(208,95%,52%)]',
    bg: 'bg-[hsl(208,95%,52%)]/10',
    text: 'text-white',
  },
  {
    name: 'Padrão',
    value: 'default',
    gradient: 'from-blue-500 to-blue-600',
    border: 'border-blue-400',
    bg: 'bg-blue-50',
    text: 'text-blue-900',
  },
  {
    name: 'Verde',
    value: 'green',
    gradient: 'from-green-500 to-emerald-600',
    border: 'border-green-400',
    bg: 'bg-green-50',
    text: 'text-green-900',
  },
  {
    name: 'Roxo',
    value: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    border: 'border-purple-400',
    bg: 'bg-purple-50',
    text: 'text-purple-900',
  },
  {
    name: 'Laranja',
    value: 'orange',
    gradient: 'from-orange-500 to-amber-600',
    border: 'border-orange-400',
    bg: 'bg-orange-50',
    text: 'text-orange-900',
  },
  {
    name: 'Rosa',
    value: 'pink',
    gradient: 'from-pink-500 to-rose-600',
    border: 'border-pink-400',
    bg: 'bg-pink-50',
    text: 'text-pink-900',
  },
  {
    name: 'Ciano',
    value: 'cyan',
    gradient: 'from-cyan-500 to-teal-600',
    border: 'border-cyan-400',
    bg: 'bg-cyan-50',
    text: 'text-cyan-900',
  },
  {
    name: 'Amarelo',
    value: 'yellow',
    gradient: 'from-yellow-500 to-amber-600',
    border: 'border-yellow-400',
    bg: 'bg-yellow-50',
    text: 'text-yellow-900',
  },
  {
    name: 'Cinza',
    value: 'gray',
    gradient: 'from-gray-500 to-slate-600',
    border: 'border-gray-400',
    bg: 'bg-gray-50',
    text: 'text-gray-900',
  },
];

export const getColorScheme = (color?: string): ColorScheme => {
  if (!color) return nodeColorSchemes[0];
  return nodeColorSchemes.find(c => c.value === color) || nodeColorSchemes[0];
};
