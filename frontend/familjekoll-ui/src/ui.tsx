import type { ComponentProps } from 'react'
import { Box as MuiBox, Stack as MuiStack, Typography as MuiTypography } from '@mui/material'

// MUI 9 removed system props (mt, display, gap, …) from components. These thin wrappers keep
// the short JSX style by moving them into `sx`.
const SYSTEM_KEYS = [
  'm', 'mt', 'mb', 'ml', 'mr', 'mx', 'my', 'p', 'pt', 'pb', 'pl', 'pr', 'px', 'py',
  'display', 'alignItems', 'justifyContent', 'flex', 'flexWrap', 'gap', 'width', 'minHeight', 'height',
  'textAlign', 'textTransform', 'fontSize', 'fontWeight', 'gridTemplateColumns', 'color', 'bgcolor', 'overflow', 'maxWidth', 'minWidth',
] as const

type SystemProps = Partial<Record<(typeof SYSTEM_KEYS)[number], unknown>>

function split<P extends object>(props: P & SystemProps) {
  const sys: Record<string, unknown> = {}
  const rest: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(props)) {
    if ((SYSTEM_KEYS as readonly string[]).includes(k)) sys[k] = v
    else rest[k] = v
  }
  return { sys, rest }
}

function mergeSx(sys: Record<string, unknown>, sx: unknown) {
  return sx && typeof sx === 'object' && !Array.isArray(sx) ? { ...sys, ...sx } : sys
}

type Polymorphic = { component?: React.ElementType; type?: string; disabled?: boolean }

export function Box(props: ComponentProps<typeof MuiBox> & SystemProps & Polymorphic) {
  const { sys, rest } = split(props)
  return <MuiBox {...(rest as ComponentProps<typeof MuiBox>)} sx={mergeSx(sys, rest.sx) as never} />
}

export function Stack(props: ComponentProps<typeof MuiStack> & SystemProps & Polymorphic) {
  const { sys, rest } = split(props)
  return <MuiStack {...(rest as ComponentProps<typeof MuiStack>)} sx={mergeSx(sys, rest.sx) as never} />
}

export function Typography(props: ComponentProps<typeof MuiTypography> & SystemProps & { component?: React.ElementType }) {
  const { sys, rest } = split(props)
  return <MuiTypography {...(rest as ComponentProps<typeof MuiTypography>)} sx={mergeSx(sys, rest.sx) as never} />
}
