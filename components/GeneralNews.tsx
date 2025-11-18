interface Props {
  readonly active: boolean;
}

export default function GeneralNews({ active }: Props) {
  if (!active) {
    return null;
  }

  return null;
}
