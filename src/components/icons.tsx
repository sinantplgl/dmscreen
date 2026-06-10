import type { SVGProps } from 'react'

// Inline SVG icons. Sized in `em` with `currentColor` so they inherit the
// surrounding font size and color — no icon font needed.
//
// Sources (all permissively licensed, monochrome/fill style):
//   • Bootstrap Icons (MIT) — the 16×16 UI glyphs.
//   • Game-icons.net (CC BY 3.0) — the 512×512 fantasy glyphs
//     (Swords, Sword, Dragon, Mage, Hook, Scroll, Elf). Authors incl. Lorc, Delapouite.

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06a.733.733 0 0 1 1.047 0l3.052 3.093l5.4-6.425z" />
    </svg>
  )
}

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793L14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5L3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
    </svg>
  )
}

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
      />
    </svg>
  )
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
    </svg>
  )
}

export function EyeSlashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
      <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
    </svg>
  )
}

export function SwordsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 512 512"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M19.75 14.438c59.538 112.29 142.51 202.35 232.28 292.718l3.626 3.75l.063-.062c21.827 21.93 44.04 43.923 66.405 66.25c-18.856 14.813-38.974 28.2-59.938 40.312l28.532 28.53l68.717-68.717c42.337 27.636 76.286 63.646 104.094 105.81l28.064-28.06c-42.47-27.493-79.74-60.206-106.03-103.876l68.936-68.938l-28.53-28.53c-11.115 21.853-24.413 42.015-39.47 60.593c-43.852-43.8-86.462-85.842-130.125-125.47c-.224-.203-.432-.422-.656-.625C183.624 122.75 108.515 63.91 19.75 14.437zm471.875 0c-83.038 46.28-154.122 100.78-221.97 161.156l22.814 21.562l56.81-56.812l13.22 13.187l-56.438 56.44l24.594 23.186c61.802-66.92 117.6-136.92 160.97-218.72zm-329.53 125.906l200.56 200.53a403 403 0 0 1-13.405 13.032L148.875 153.53zm-76.69 113.28l-28.5 28.532l68.907 68.906c-26.29 43.673-63.53 76.414-106 103.907l28.063 28.06c27.807-42.164 61.758-78.174 104.094-105.81l68.718 68.717l28.53-28.53c-20.962-12.113-41.08-25.5-59.937-40.313c17.865-17.83 35.61-35.433 53.157-52.97l-24.843-25.655l-55.47 55.467c-4.565-4.238-9.014-8.62-13.374-13.062l55.844-55.844l-24.53-25.374c-18.28 17.856-36.602 36.06-55.158 54.594c-15.068-18.587-28.38-38.758-39.5-60.625z"/>
    </svg>
  )
}

export function SwordIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 512 512"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="m491.844 22.533l-83.42 14.865L196.572 249.25c3.262 4.815 5.37 10.72 5.37 16.932c0 5.863-1.71 11.35-4.643 15.996a53 53 0 0 0-16.027-2.477c-15.724 0-29.904 6.89-39.69 17.796l-9.112-9.113l17.237-17.237a546 546 0 0 1-13.19-17.6l-19.443 19.44l-13.215-13.215l21.828-21.827a548 548 0 0 1-12.792-20.068L72.093 258.68l58.314 58.314a53 53 0 0 0-2.49 16.063a52.9 52.9 0 0 0 4.592 21.564l-72.14 72.14l-14.56-14.56L21.013 437l14.558 14.56l-8.607 8.608l27.246 27.246l8.606-8.61l14.56 14.56l24.798-24.8l-14.557-14.556l72.158-72.16a52.9 52.9 0 0 0 21.498 4.562a53 53 0 0 0 16.063-2.49l58.363 58.363L296.5 401.48a549 549 0 0 1-20.068-12.793l-21.83 21.83L241.39 397.3l19.442-19.44a550 550 0 0 1-17.603-13.194l-17.238 17.238l-9.16-9.16c10.905-9.785 17.795-23.965 17.795-39.69c0-5.346-.806-10.51-2.285-15.39c4.703-3.04 10.288-4.817 16.265-4.816c6.21 0 11.776 1.77 16.52 4.955L476.98 105.95zm-66.227 53.012l13.215 13.215l-191.684 191.68l-13.214-13.213zM181.273 298.39c19.257 0 34.665 15.41 34.665 34.665c0 19.256-15.408 34.666-34.665 34.666s-34.666-15.41-34.666-34.665s15.41-34.666 34.666-34.666"/>
    </svg>
  )
}

export function DiceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M3 0a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3zm2.5 4a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m8 0a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0M12 13.5a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3M5.5 12a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0M8 9.5a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3"/>
    </svg>
  )
}

export function DragonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 512 512"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M200.947 18.686c-6.98.087-14.64.774-22.85 1.9c27.57 20.468 51.098 45.25 67.594 70.527c1.66 0 3.312.012 4.958.047c18.066.39 35.487 2.906 53.217 7.2c-15.695-28.457-29.935-50.19-47.45-63.22c-13.817-10.278-30.063-16.168-52.52-16.454q-1.45-.02-2.948 0zm-91.66 22.96q-1.094-.002-2.195.022c-14.045.31-29.36 3.92-46.86 11.13c56.18 18.807 106.985 50.468 133.907 83.585c18.377-5.13 29.44-14.72 36.454-28.817C195.84 78.18 168.118 56.19 140.65 46.96c-10.168-3.418-20.433-5.306-31.363-5.315zm-.203 52.786c-39.42 6.758-74.73 31.854-87.822 74.19v322.345h212.73C100.352 442.58 61.19 206.49 187.115 230.104c5.838-14.164 9.92-28.027 11.018-41.465l18.627 1.522c-1.684 20.592-8.828 40.49-18.033 59.943c-.732 2.035-1.472 4.12-2.186 6.063c32.842 85.24 113.77 160.69 169.495 168.197c.915.033 1.905-.002 2.953-.09c17.016 1.035 35.86-4.222 52.21-22.304l7.984-8.83l-10.473-5.658c-6.507-3.515-14.29-7.094-18.167-10.925c-1.938-1.916-2.793-3.47-3.074-5.194c-.282-1.725-.13-4.227 2.23-8.578l10.673-19.656l-21.484 6.222c-6.304 1.825-17.305-3.032-23.224-10.71c-2.96-3.84-4.408-7.907-4.387-10.843c.02-2.938.72-5.125 4.747-8.05l19.453-14.125l-23.884-2.72c-9.974-1.137-16.37-6.658-19.17-12.294c-2.802-5.634-2.312-10.084 1.375-13.31l12.204-10.677l-15.358-5.205c-6.717-2.276-10.296-7.555-10.357-10.633c-.028-1.373.238-2.666 1.843-4.476c10.93-2.39 21.258-.45 28.088 6.374c6.154 6.146 8.35 15.128 6.977 24.832c8.55-2.254 16.985-1.616 24.112 2.494c9.34 5.387 14.647 15.692 15.67 27.965c15.212-10.132 32.152-12.725 45.262-5.164c15.467 8.92 21.36 29.513 16.805 51.75c23.992-33.355 34.588-75.717 5.617-120.43c-46.726-4.442-81.693-30.676-93.293-67.64c-5.026-16.016-21.284-28.67-42-37.904l-.08.217c-29.74-10.823-55.575-17.35-82.604-18.733l.08.155c-2.294-.093-4.56-.16-6.762-.172c-9.537 22.874-28.662 39.9-57.436 46.054l-5.906 1.262l-3.576-4.864c-14.216-19.33-41.23-40.452-74.002-58.074zm156.215 65.26c27.927-.073 44.874 11.617 42.09 44.45c-35.844 3.39-51.933-16.683-63.074-42.632c7.507-1.155 14.538-1.8 20.983-1.817zm48.407 66.363c3.708.07 7.14.994 10.014 2.812a35 35 0 0 0-4.16 3.543c-5.246 5.24-8.087 12.122-7.956 18.742c.183 9.322 5.27 17.184 12.68 22.56c-3.14 8.103-2.452 17.455 1.407 25.22c3.813 7.668 10.54 14.273 19.302 18.398c-1.445 3.366-2.375 6.862-2.4 10.33c-.062 8.407 3.38 16.042 8.273 22.39c6.792 8.81 16.862 15.936 28.026 17.91c-.183 2.18-.204 4.333.133 6.407c1.05 6.444 4.515 11.66 8.38 15.48c3.41 3.37 7.19 5.892 10.798 7.993c-6.345 4.792-12.414 7.056-18.618 7.79c-6.515-7.937-9.71-19.084-9.41-31.454c-11.767 6.177-24.21 7.156-34.12 1.44c-14.668-8.46-19.393-29.036-13.187-50.33c-11.336 2.77-22.13.92-29.187-6.132c-8.875-8.865-9.535-23.626-3.094-37.95c-3.676-.615-6.963-2.166-9.525-4.725c-8.808-8.798-5.773-26.09 6.776-38.626c7.843-7.835 17.546-11.957 25.87-11.8z"/>
    </svg>
  )
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453a7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625a11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43A63 63 0 0 1 5.072.56"/>
    </svg>
  )
}

export function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02c1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877c1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
    </svg>
  )
}

export function CompassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M15.5 8.516a7.5 7.5 0 1 1-9.462-7.24A1 1 0 0 1 7 0h2a1 1 0 0 1 .962 1.276a7.5 7.5 0 0 1 5.538 7.24m-3.61-3.905L6.94 7.439L4.11 12.39l4.95-2.828l2.828-4.95z"/>
    </svg>
  )
}

export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19c.48.263.793.434.743.484q-.121.12-.242.234c-.416.396-.787.749-.758 1.266c.035.634.618.824 1.214 1.017c.577.188 1.168.38 1.286.983c.082.417-.075.988-.22 1.52c-.215.782-.406 1.48.22 1.48c1.5-.5 3.798-3.186 4-5c.138-1.243-2-2-3.5-2.5c-.478-.16-.755.081-.99.284c-.172.15-.322.279-.51.216c-.445-.148-2.5-2-1.5-2.5c.78-.39.952-.171 1.227.182c.078.099.163.208.273.318c.609.304.662-.132.723-.633c.039-.322.081-.671.277-.867c.434-.434 1.265-.791 2.028-1.12c.712-.306 1.365-.587 1.579-.88A7 7 0 1 1 2.04 4.327Z"/>
    </svg>
  )
}

export function FilmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm4 0v6h8V1zm8 8H4v6h8zM1 1v2h2V1zm2 3H1v2h2zM1 7v2h2V7zm2 3H1v2h2zm-2 3v2h2v-2zM15 1h-2v2h2zm-2 3v2h2V4zm2 3h-2v2h2zm-2 3v2h2v-2zm2 3h-2v2h2z"/>
    </svg>
  )
}

export function MapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.598-.49L10.5.99L5.598.01a.5.5 0 0 0-.196 0l-5 1A.5.5 0 0 0 0 1.5v14a.5.5 0 0 0 .598.49l4.902-.98l4.902.98a.5.5 0 0 0 .196 0l5-1A.5.5 0 0 0 16 14.5zM5 14.09V1.11l.5-.1l.5.1v12.98l-.402-.08a.5.5 0 0 0-.196 0zm5 .8V1.91l.402.08a.5.5 0 0 0 .196 0L11 1.91v12.98l-.5.1z"/>
    </svg>
  )
}

export function DoorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M12 1a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2a1 1 0 0 1 1-1zm-2 9a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/>
    </svg>
  )
}

export function MageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 512 512"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M416.125 42.406c-57.576.457-104.863 25.804-144.813 64.875c-41.984 41.063-75 97.61-100 155.5c.78 4.503 3.06 8.946 7.094 13.658c5.158 6.024 13.183 12.113 23.188 17.593c20.01 10.962 47.79 19.545 75.5 24.47s55.505 6.21 75.156 3.438c9.825-1.386 17.538-3.91 21.813-6.563s4.916-3.957 4.812-6.625l.72-.03c-3.408-42.828-6-88.797.092-131.94c2.82-19.972 7.668-39.434 15.22-57.624c-31.573 31.44-62.918 65.425-86.844 94.72c35.418-70.2 86.2-121.398 141.125-168.97c-11.376-1.71-22.42-2.584-33.063-2.5zM155.21 238.994a407 407 0 0 0-13.334.131c-23.138.575-44.227 2.91-61.876 7.188c-23.532 5.703-40.466 14.888-48.78 26.03c-8.317 11.144-10.08 24.667-.97 45.532c32.86 75.263 117.185 130.26 207.844 148.594c90.66 18.33 186.108.147 242.28-66.75c13.59-16.185 15.297-29.312 9.938-43.22c-5.358-13.908-19.586-28.878-40.78-42.75c-14.745-9.65-32.683-18.737-52.75-27.03c1.506 22.59 3.555 44.877 5.124 65.967v.219c.607 11.402-5.49 21.585-14.344 27.938s-20.268 10.08-33.437 12.406c-26.337 4.654-60.026 3.398-93.344-2.188c-33.317-5.585-66.085-15.466-90.28-29.312c-12.097-6.923-22.145-14.85-28.875-24.47c-6.73-9.617-9.76-21.554-6.594-33.374l.095-.375l.125-.374c7.637-21.206 16.308-42.79 26.094-64.094a634 634 0 0 0-6.133-.068zm6.634 46.662A839 839 0 0 0 153.031 309c-1.595 6.246-.4 11.407 3.907 17.563c4.374 6.25 12.28 12.923 22.844 18.968c21.128 12.09 52.4 21.78 84.095 27.095c31.694 5.314 64.016 6.28 87 2.22c11.492-2.032 20.53-5.42 25.78-9.19c5.25-3.766 6.864-6.726 6.595-11.78c-.517-6.93-1.088-14.027-1.688-21.25c-7.448 4.03-16.47 6.367-26.718 7.813c-22.732 3.206-51.79 1.665-81.03-3.532c-29.242-5.196-58.5-14.055-81.22-26.5c-11.36-6.222-21.122-13.34-28.375-21.812a59 59 0 0 1-2.376-2.938z"/>
    </svg>
  )
}

export function GemIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M3.1.7a.5.5 0 0 1 .4-.2h9a.5.5 0 0 1 .4.2l2.976 3.974c.149.185.156.45.01.644L8.4 15.3a.5.5 0 0 1-.8 0L.1 5.3a.5.5 0 0 1 0-.6zm11.386 3.785l-1.806-2.41l-.776 2.413zm-3.633.004l.961-2.989H4.186l.963 2.995zM5.47 5.495L8 13.366l2.532-7.876zm-1.371-.999l-.78-2.422l-1.818 2.425zM1.499 5.5l5.113 6.817l-2.192-6.82zm7.889 6.817l5.123-6.83l-2.928.002z"/>
    </svg>
  )
}

export function HookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 512 512"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M19.125 18.656v6.032l54.438 53.906h.03v.03c2.217 2.217 3.63 2.42 6.063 2.032c2.434-.39 5.708-2.133 8.28-4.75c2.575-2.617 4.295-5.977 4.69-8.5c.393-2.522.15-3.913-1.876-5.937L47.97 18.655H19.124zM82.47 26.72l21.5 21.53c4.92 4.92 7.263 11.428 7.405 17.594c6.714.273 13.716 3.122 19.22 8.625l17.468 17.468c.34-6.957-1.773-13.648-7.25-19.126l-36.782-36.78c-6.475-6.477-13.824-9.254-21.218-9.313a10 10 0 0 0-.343 0zm-42.907 44.5c.058 7.362 2.678 14.552 8.718 20.593l36.782 36.78c5.65 5.652 12.415 7.837 19.376 7.5l-17.72-17.718c-5.363-5.364-8.03-12.332-8.28-18.97c-6.285-.08-12.954-2.5-18-7.53l-.032-.03l-20.843-20.626zm70.968 13.25c-.31.01-.615.026-.936.06c-2.572.284-5.678 1.858-8.125 4.407c-2.45 2.55-4.063 5.91-4.345 8.688s.198 4.917 2.813 7.53l76.187 76.19c2.197 2.196 3.592 2.374 6.063 1.968s5.784-2.178 8.406-4.844c2.62-2.667 4.4-6.098 4.812-8.657s.16-3.933-1.844-5.938l-76.187-76.188c-2.667-2.666-4.665-3.29-6.844-3.218zm73.907 43.843l22.344 22.343c4.72 4.72 7.05 10.902 7.345 16.844c6.355.545 12.876 3.377 18.063 8.563l17.468 17.468c.34-6.953-1.772-13.646-7.25-19.124l-36.78-36.78c-6.46-6.46-13.816-9.24-21.19-9.314m-43.28 44.468c.06 7.362 2.678 14.555 8.718 20.595l36.75 36.78c5.658 5.66 12.433 7.843 19.406 7.5l-17.718-17.718v-.03c-5.076-5.085-7.768-11.573-8.25-17.876c-6.042-.275-12.34-2.682-17.156-7.5zm70.937 13.282c-.312.01-.616.028-.938.063c-2.572.283-5.677 1.857-8.125 4.406c-2.446 2.55-4.03 5.88-4.31 8.657c-.284 2.778.166 4.918 2.78 7.532l76.188 76.186c2.196 2.197 3.59 2.407 6.062 2c2.47-.407 5.816-2.177 8.438-4.844c2.62-2.666 4.37-6.097 4.78-8.656c.412-2.56.193-3.933-1.812-5.937l-76.187-76.19c-2.668-2.666-4.692-3.29-6.876-3.218zm71.03 29.97a55.5 55.5 0 0 0-9.905 1.062l35.124 35.156c6.147 6.147 8.275 14.778 7.094 22.125s-4.958 13.717-9.938 18.78c-4.98 5.066-11.316 8.97-18.72 10.19c-7.4 1.218-16.1-1.008-22.31-7.22l-35.845-35.844c-4.095 17.737.565 36.847 14.094 50.376c11.374 11.376 26.703 16.47 41.843 15.375l.062.22c.365-.11.75-.205 1.125-.313a56 56 0 0 0 13.28-2.906c30.926-4.998 78.05-2.65 108.783 13.25c37.49 19.398 53.545 58.738 35.843 87.845c-17.13 28.168-59.12 36.55-96.25 12.53l26.688-12.155l-68.938-31.156l9.125 22.03l23.095 69.407l111.53-5.31l7.97-28.314l27.875-7.97l5.75-111.53l-154.313-50.937c3.607-17.396-1.155-35.938-14.375-49.158c-10.587-10.587-24.592-15.75-38.687-15.53z"/>
    </svg>
  )
}

export function MusicIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <g fill="currentColor"><path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13s1.12-2 2.5-2s2.5.896 2.5 2m9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2s1.12-2 2.5-2s2.5.895 2.5 2"/><path fillRule="evenodd" d="M14 11V2h1v9zM6 3v10H5V3z"/><path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4z"/></g>
    </svg>
  )
}

export function NoteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <g fill="currentColor"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/></g>
    </svg>
  )
}

export function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>
    </svg>
  )
}

export function ImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71l-2.66-1.772a.5.5 0 0 0-.63.062zm5-6.5a1.5 1.5 0 1 0-3 0a1.5 1.5 0 0 0 3 0"/>
    </svg>
  )
}

export function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <g fill="currentColor"><path d="M4.715 6.542L3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199a2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/></g>
    </svg>
  )
}

export function LightningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
    </svg>
  )
}

export function WarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2a1 1 0 0 1 0-2"/>
    </svg>
  )
}

export function VolumeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <g fill="currentColor"><path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/><path d="M8.707 11.182A4.5 4.5 0 0 0 10.025 8a4.5 4.5 0 0 0-1.318-3.182L8 5.525A3.5 3.5 0 0 1 9.025 8A3.5 3.5 0 0 1 8 10.475zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06"/></g>
    </svg>
  )
}

export function ScrollIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 512 512"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M103.432 17.844a87 87 0 0 0-3.348.08q-3.822.163-7.604.678c-20.167 2.747-39.158 13.667-52.324 33.67c-24.613 37.4 2.194 98.025 56.625 98.025c.536 0 1.058-.012 1.583-.022v.704h60.565c-10.758 31.994-30.298 66.596-52.448 101.43a283 283 0 0 0-6.29 10.406l34.878 35.733l-56.263 9.423c-32.728 85.966-27.42 182.074 48.277 182.074v-.002l9.31.066c23.83-.57 46.732-4.298 61.325-12.887c4.174-2.458 7.63-5.237 10.467-8.42h-32.446c-20.33 5.95-40.8-6.94-47.396-25.922c-8.956-25.77 7.52-52.36 31.867-60.452a55.6 55.6 0 0 1 17.565-2.834v-.406h178.33c-.57-44.403 16.35-90.125 49.184-126c23.955-26.176 42.03-60.624 51.3-94.846l-41.225-24.932l38.272-6.906l-43.37-25.807h-.005l.002-.002l.002.002l52.127-8.85c-5.232-39.134-28.84-68.113-77.37-68.113C341.14 32.26 222.11 35.29 149.34 28.496c-14.888-6.763-30.547-10.723-45.908-10.652m.464 18.703c13.137.043 27.407 3.804 41.247 10.63l.033-.07c4.667 4.735 8.542 9.737 11.68 14.985H82.92l10.574 14.78c10.608 14.83 19.803 31.99 21.09 42.024c.643 5.017-.11 7.167-1.814 8.836c-1.705 1.67-6.228 3.875-15.99 3.875c-40.587 0-56.878-44.952-41.012-69.06C66.238 46.64 79.582 39.22 95.002 37.12a64 64 0 0 1 8.894-.573M118.5 80.78h46.28c4.275 15.734 3.656 33.07-.544 51.51H131.52c1.9-5.027 2.268-10.574 1.6-15.77c-1.527-11.913-7.405-24.065-14.62-35.74m101.553 317.095c6.44 6.84 11.192 15.31 13.37 24.914c3.797 16.736 3.092 31.208-1.767 43.204c-4.526 11.175-12.576 19.79-22.29 26h237.19c14.448 0 24.887-5.678 32.2-14.318c7.312-8.64 11.2-20.514 10.705-32.352a47.7 47.7 0 0 0-2.407-13.18l-69.91-8.205l42.017-20.528c-8.32-3.442-18.64-5.537-31.375-5.537H220.053zm-42.668.506a37 37 0 0 0-3.457.153a34.8 34.8 0 0 0-7.824 1.63c-15.11 5.02-25.338 21.54-20.11 36.583c3.673 10.57 15.347 17.71 25.654 13.938l1.555-.57h43.354c.946-6.36.754-13.882-1.358-23.192c-3.71-16.358-20.543-28.483-37.815-28.54z"/>
    </svg>
  )
}

export function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>
    </svg>
  )
}

export function CastleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M15 .5a.5.5 0 0 0-.724-.447l-8 4A.5.5 0 0 0 6 4.5v3.14L.342 9.526A.5.5 0 0 0 0 10v5.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V14h1v1.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5zM2 11h1v1H2zm2 0h1v1H4zm-1 2v1H2v-1zm1 0h1v1H4zm9-10v1h-1V3zM8 5h1v1H8zm1 2v1H8V7zM8 9h1v1H8zm2 0h1v1h-1zm-1 2v1H8v-1zm1 0h1v1h-1zm3-2v1h-1V9zm-1 2h1v1h-1zm-2-4h1v1h-1zm3 0v1h-1V7zm-2-2v1h-1V5zm1 0h1v1h-1z"/>
    </svg>
  )
}

export function AttunementIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      {/* Outer box */}
      <path fillRule="evenodd" d="M1 1h14v14H1V1zm1 1v12h12V2H2z" />
      {/* Letter A */}
      <path d="M8 3.5L4.5 12h1.2l.9-2.2h2.8l.9 2.2h1.2L8 3.5zm0 2.1 1.05 2.9H6.95L8 5.6z" />
    </svg>
  )
}

// ── UI glyphs (Bootstrap Icons, MIT) ──
export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
    </svg>
  )
}
export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" />
    </svg>
  )
}
export function ListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
    </svg>
  )
}
export function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5z" />
    </svg>
  )
}

// ── Extra fantasy glyphs for custom node types (game-icons.net, CC BY 3.0) ──
export function TrapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M27.7 23.7v48.1l79.9 53.3v-39.2zm456.6 0l-79.9 62.2v39.2l79.9-53.3zM171.3 84.5c-9.7.13-19.4 3.43-27.5 9.92l85.4 68.28c3.2-4.6 7.1-8.7 11.5-12.3l-52.9-60.49c-5.3-3.62-11-5.49-16.5-5.41zm169.4 0c-5.5-.08-11.2 1.79-16.5 5.41l-52.9 60.49c4.4 3.6 8.3 7.7 11.5 12.3l85.4-68.28c-8.1-6.49-17.8-9.79-27.5-9.92zM256 169c-22 0-39.9 17.9-39.9 39.9 0 22.1 17.9 40 39.9 40s39.9-17.9 39.9-40c0-22-17.9-39.9-39.9-39.9zM73.9 152.6L18 192.7l66.65 31.8 33.85-25.4zm364.2 0l-44.5 46.5 33.9 25.4 66.6-31.8zM256 267.4c-12.5 0-24.3-3.3-34.5-9l-50.6 187.9 39.7-15.5L256 348l45.4 82.8 39.7 15.5-50.6-187.9c-10.2 5.7-22 9-34.5 9zm-153.2-31.9l-70.46 41.7 50.06 27.6 56.5-42.4zm306.4 0l-36.1 26.9 56.5 42.4 50.1-27.6z"/>
    </svg>
  )
}
export function PotionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M192 32v32h32V32zm96 0v32h32V32zM208 96c-8.8 0-16 7.2-16 16v66.9c0 12.7-5.6 24.8-15.3 33.1l-66.2 56.7C92.4 287.2 80 314 80 342.3V400c0 44.2 35.8 80 80 80h192c44.2 0 80-35.8 80-80v-57.7c0-28.3-12.4-55.1-30.5-73.6l-66.2-56.7c-9.7-8.3-15.3-20.4-15.3-33.1V112c0-8.8-7.2-16-16-16zm16 32h64v50.9c0 23.7 10.4 46.2 28.5 61.6l66.2 56.7c1.4 1.2 2.7 2.5 4 3.8H125.3c1.3-1.3 2.6-2.6 4-3.8l66.2-56.7c18.1-15.4 28.5-37.9 28.5-61.6z"/>
    </svg>
  )
}
export function KeyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5m0 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
    </svg>
  )
}
export function CrownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M256 64l-58.7 117.3L64 117.3l37.3 224h309.4l37.3-224-133.3 64zM96 384v64h320v-64z"/>
    </svg>
  )
}
export function SkullIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M8 0C4.7 0 2 2.7 2 6c0 2 1 3.8 2.5 4.9V13c0 .6.4 1 1 1h1v-1.5a.5.5 0 0 1 1 0V14h1v-1.5a.5.5 0 0 1 1 0V14h1c.6 0 1-.4 1-1v-2.1C13 9.8 14 8 14 6c0-3.3-2.7-6-6-6M5.5 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
    </svg>
  )
}
export function ChestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M80 96C53.5 96 32 117.5 32 144v48h448v-48c0-26.5-21.5-48-48-48zm-48 128v144c0 26.5 21.5 48 48 48h152v-48h-16a16 16 0 0 1-16-16v-32a16 16 0 0 1 16-16h16v-32zm288 0v32h16a16 16 0 0 1 16 16v32a16 16 0 0 1-16 16h-16v48h112c26.5 0 48-21.5 48-48V224zm-32 0v32h-64v-32zm0 80v48h-64v-48z"/>
    </svg>
  )
}
export function CoinsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M5 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7M2.5 7A2.5 2.5 0 0 1 5 4.5a.5.5 0 0 1 0 1A1.5 1.5 0 0 0 3.5 7a.5.5 0 0 1-1 0M11 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7M8.5 9A2.5 2.5 0 0 1 11 6.5a.5.5 0 0 1 0 1A1.5 1.5 0 0 0 9.5 9a.5.5 0 0 1-1 0"/>
    </svg>
  )
}
export function TorchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M256 16c-32 48-80 80-80 144 0 23 9 44 24 59-8-4-15-10-21-18-12 18-19 39-19 61 0 53 43 96 96 96s96-43 96-96c0-22-7-43-19-61-6 8-13 14-21 18 15-15 24-36 24-59 0-64-48-96-80-144zm-40 384l-40 96h160l-40-96z"/>
    </svg>
  )
}
export function BannerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M4 0a1 1 0 0 0-1 1v14.5a.5.5 0 0 0 .8.4L8 12.5l4.2 3.4a.5.5 0 0 0 .8-.4V1a1 1 0 0 0-1-1zm4 8.5L5.5 10V3h5v7z"/>
    </svg>
  )
}
export function TowerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M96 32v64H64v64h32v288h96V336a64 64 0 0 1 128 0v112h96V160h32V96h-32V32h-64v64h-64V32h-64v64h-64V32z"/>
    </svg>
  )
}
export function TreeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M256 16l-96 160h48L128 304h64L96 432h160v64h0v-64h160l-96-128h64l-80-128h48z"/>
    </svg>
  )
}
export function ShipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M240 16v48h-80v48h80v160H64l32 128c0 32 64 64 160 64s160-32 160-64l32-128H272V112h80V64h-80V16zM96 304h320l-20 80c-8 16-60 48-140 48s-132-32-140-48z"/>
    </svg>
  )
}
export function AnchorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M1 8a7 7 0 1 0 14 0h-1.5a5.5 5.5 0 0 1-4.75 5.45V6h1.5V4.5H8.75V3.45a1.5 1.5 0 1 0-1.5 0V4.5H5.75V6h1.5v7.45A5.5 5.5 0 0 1 2.5 8zM8 1.5a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1"/>
    </svg>
  )
}
export function SpiderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M256 176a64 64 0 1 0 0 128 64 64 0 0 0 0-128zM112 96l-64-32-16 48 80 48 32 48-96 16v48l96 16-32 48-80 48 16 48 64-32 48-64h32l48 64 64 32 16-48-80-48-32-48 96-16v-48l-96-16 32-48 80-48-16-48-64 32-48 64h-32l-48-64z"/>
    </svg>
  )
}
export function WolfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M128 32l32 96-96 32 64 48-48 80 96 16 32 80 48-48 48 48 32-80 96-16-48-80 64-48-96-32 32-96-96 64h-64zm80 160a24 24 0 1 1 0 48 24 24 0 0 1 0-48zm96 0a24 24 0 1 1 0 48 24 24 0 0 1 0-48zm-48 96l24 40h-48z"/>
    </svg>
  )
}
export function BowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M464 48l-48 16-16 48-224 224-48-16-16 48 32 32-80 80 24 24 80-80 32 32 48-16-16-48L464 144l48-16zM192 320l-32-32 192-192 32 32z"/>
    </svg>
  )
}
export function AxeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M320 32c-96 0-160 48-192 128 64-32 128-16 160 32l-208 256 48 32 192-240c48 16 96 0 112-64-32 16-64 0-80-32 48-48 16-128-32-140z"/>
    </svg>
  )
}
export function HelmetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M256 48C149 48 64 133 64 240v80h80v-64h32v64h32v-64h32v64h32v-64h32v64h32v-64h32v64h80v-80C448 133 363 48 256 48zM64 352v32a64 64 0 0 0 64 64h256a64 64 0 0 0 64-64v-32z"/>
    </svg>
  )
}
export function RingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M256 64l-48 80h96zm0 128c-88 0-160 58-160 160s72 96 160 96 160-32 160-96-72-160-160-160zm0 64a96 96 0 1 1 0 192 96 96 0 0 1 0-192z"/>
    </svg>
  )
}
export function WandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M352 32l-24 56-56 24 56 24 24 56 24-56 56-24-56-24zM96 160l-32 32 224 224 32-32zm48 32l176 176-16 16-176-176z"/>
    </svg>
  )
}
export function CauldronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M224 32v48h-48l32 48h-80v64H64v32h32l32 192c0 32 64 64 128 64s128-32 128-64l32-192h32v-32h-64v-64h-80l32-48h-48V32zM96 256h320l-8 48H104z"/>
    </svg>
  )
}
export function MugIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M2 2v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm8 2h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2zM3 1h6a1 1 0 0 1 0 0z"/>
    </svg>
  )
}
export function MountainIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M6 2.5 2.5 9 1 12h14l-1.5-3-2.5-5-2 4-1.5-2.5zm0 2.2 1 1.6L8.8 9H4.2z"/>
    </svg>
  )
}
export function SnakeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true" style={{ verticalAlign: '-0.125em' }} {...props}>
      <path fill="currentColor" d="M384 64c-53 0-96 43-96 96v32a64 64 0 0 1-64 64H96a96 96 0 0 0 0 192h32v-64H96a32 32 0 0 1 0-64h128a128 128 0 0 0 128-128v-32a32 32 0 0 1 64 0v32h64v-32c0-53-43-96-96-96zm32 64a16 16 0 1 1 0 32 16 16 0 0 1 0-32zM160 384v64l64 32v-64z"/>
    </svg>
  )
}

export function GearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
    </svg>
  )
}

export function TagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path d="M2 2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 2zm4 2.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0" />
    </svg>
  )
}

export function ElfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 512 512"
      aria-hidden="true"
      style={{ verticalAlign: '-0.125em' }}
      {...props}
    >
      <path fill="currentColor" d="M107.3 26c-4.146 0-8.6 22.976-13.214 42.934l32.187 100.97l-39.052-69.726c-2.932 14.342-5.414 28.62-7.002 42.771l43.176 58.246l-44.838-36.824c-.435 11.08-.15 22.056 1.078 32.897l45.515 36.597l-40.89-13.285c2.558 9.025 5.94 18.077 9.812 27.049l40.819 26.943l-30.065-4.312c13.83 26.954 29.823 52.218 38.697 72.506c2.565 5.13 8.023 16.754 10.926 28.168c3.89 15.695-4.529 35.939-21.271 38.322c12.285-14.291 13.245-23.507 11.02-32.535c-13.242-.192-19.112 15.916-19.112 15.916s-12.527 23.473 15.717 59.369s67.176 33.974 67.176 33.974s-2.243-55.044-1.036-79.96c1.22-25.165 8.354-69.758 8.354-69.758s-19.998.093-42.443-15.8c-28.167-19.942-17.51-32.621-24.663-51.077c-14.417-37.201-4.68-95.143-4.68-95.143s-10.858-42.59-17.85-72.822C119.864 76.366 110.398 26 107.3 26m297.4 0c-3.099 0-12.565 50.366-18.36 75.42c-6.993 30.232-17.852 72.822-17.852 72.822s9.738 57.942-4.68 95.143c-7.152 18.456 3.505 31.135-24.662 51.078c-22.445 15.892-42.443 15.8-42.443 15.8s7.134 44.592 8.354 69.757c1.207 24.916-1.036 79.962-1.036 79.962s38.932 1.92 67.176-33.976s15.717-59.37 15.717-59.37s-5.87-16.107-19.111-15.915c-2.226 9.028-1.266 18.246 11.02 32.537c-16.743-2.383-25.162-22.629-21.272-38.324c2.903-11.414 8.361-23.037 10.926-28.168c8.874-20.288 24.868-45.552 38.699-72.506l-30.067 4.312l40.819-26.943c3.872-8.972 7.254-18.024 9.812-27.049l-40.89 13.285l45.515-36.597c1.228-10.84 1.513-21.817 1.078-32.897l-44.838 36.824l43.176-58.246c-1.588-14.15-4.07-28.429-7.002-42.771l-39.052 69.726l32.187-100.968C413.3 48.978 408.846 26 404.7 26m-148.702.463c-19.388 0-64.1 45.402-88.344 75.728c-7.017 8.779-15.795 29.823-15.795 29.823l9.194 37.289s-1.154 8.452-2.604 30.49c-1.091 16.591-1.054 32.803-1.054 32.803l52.677-16.893c4.003-22.545 11.506-52.087 20.246-77.21c7.007-20.141 25.68-58.575 25.68-58.575s19.2 36.655 26.072 56.107c9.115 25.801 15.807 57.482 19.856 79.678l52.678 16.893s.036-16.212-1.055-32.803c-1.45-22.038-2.604-30.49-2.604-30.49l9.194-37.29s-6.09-19.371-12.035-27.349c-24.096-32.334-72.718-78.201-92.106-78.201m.002 77.09s-10.719 28.18-15.37 50.697c-4.299 20.818-11.898 66.635-11.898 66.635s11.983 11.928 5.682 18.256s-17.043-5.705-17.043-5.705l-56.435 17.128l3.337 13.217l53.098 19.854s10.656-12.118 17.043-5.703c6.388 6.414-5.682 23.959-5.682 23.959s3.879 16.06 5.995 24.045c3.45 13.022 10.927 38.908 10.927 38.908l10.344 2.867l10.346-2.867s6.8-24.203 10.047-36.346c2.366-8.85 6.875-26.607 6.875-26.607s-12.07-17.545-5.682-23.96s17.043 5.704 17.043 5.704l53.098-19.854l3.337-13.217l-56.435-17.128s-10.742 12.033-17.043 5.705s5.682-18.256 5.682-18.256s-7.547-42.316-11.897-65.81C267.12 132.121 256 103.552 256 103.552zm0 136.369c5.02 0 9.088 8.172 9.088 18.254c0 10.081-4.068 18.256-9.088 18.256s-9.09-8.175-9.09-18.256c0-10.082 4.07-18.254 9.09-18.254"/>
    </svg>
  )
}
