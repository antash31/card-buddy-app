// #genai: Hand-rolled SVG icons — a handful of 24px glyphs, drawn on a shared grid so stroke
// weight and optical size stay consistent without pulling in an icon library.
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

// A 1.5 stroke rather than the usual 1.8: at this weight the glyphs sit at the same optical
// density as the hairline rules they share a screen with, instead of shouting over them.
function Glyph({ size = 20, color = 'currentColor', strokeWidth = 1.5, children }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

export function EyeIcon(props) {
  return (
    <Glyph {...props}>
      <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <Circle cx="12" cy="12" r="3" />
    </Glyph>
  );
}

export function EyeOffIcon(props) {
  return (
    <Glyph {...props}>
      <Path d="M10.6 5.2A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a17.9 17.9 0 0 1-3.1 4.1" />
      <Path d="M6.3 6.5A17.6 17.6 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.5-1.1" />
      <Path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <Line x1="3" y1="3" x2="21" y2="21" />
    </Glyph>
  );
}

export function MailIcon(props) {
  return (
    <Glyph {...props}>
      <Rect x="2.5" y="4.5" width="19" height="15" rx="3" />
      <Path d="m3.5 7 7.4 5.2a2 2 0 0 0 2.2 0L20.5 7" />
    </Glyph>
  );
}

export function LockIcon(props) {
  return (
    <Glyph {...props}>
      <Rect x="4" y="10.5" width="16" height="10.5" rx="2.5" />
      <Path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </Glyph>
  );
}

export function UserIcon(props) {
  return (
    <Glyph {...props}>
      <Circle cx="12" cy="8" r="3.8" />
      <Path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </Glyph>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <Glyph {...props}>
      <Line x1="20" y1="12" x2="4" y2="12" />
      <Polyline points="10 6 4 12 10 18" />
    </Glyph>
  );
}

export function CheckIcon(props) {
  return (
    <Glyph {...props}>
      <Polyline points="4 12.5 9.5 18 20 6.5" />
    </Glyph>
  );
}

export function CameraIcon(props) {
  return (
    <Glyph {...props}>
      <Path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.9l1.3-2h6.6l1.3 2h1.9A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5Z" />
      <Circle cx="12" cy="13" r="3.6" />
    </Glyph>
  );
}

export function AlertIcon(props) {
  return (
    <Glyph {...props}>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="12" y1="7.5" x2="12" y2="13" />
      <Line x1="12" y1="16.5" x2="12" y2="16.6" />
    </Glyph>
  );
}

export function SearchIcon(props) {
  return (
    <Glyph {...props}>
      <Circle cx="11" cy="11" r="6.5" />
      <Line x1="16" y1="16" x2="21" y2="21" />
    </Glyph>
  );
}

export function PlusIcon(props) {
  return (
    <Glyph {...props}>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Glyph>
  );
}

export function TrashIcon(props) {
  return (
    <Glyph {...props}>
      <Polyline points="4 7 6 7 20 7" />
      <Path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <Path d="M6.5 7h11l-.7 12.2A2 2 0 0 1 14.8 21H9.2a2 2 0 0 1-2-1.8L6.5 7Z" />
    </Glyph>
  );
}

/** Card Nest — a stack of cards seen slightly from the side. */
export function NestIcon(props) {
  return (
    <Glyph {...props}>
      <Rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
      <Path d="M6 7.5V6a2 2 0 0 1 2-2h11" />
      <Line x1="3" y1="11.5" x2="21" y2="11.5" />
    </Glyph>
  );
}

export function ChevronRightIcon(props) {
  return (
    <Glyph {...props}>
      <Polyline points="9 5 16 12 9 19" />
    </Glyph>
  );
}

export function XIcon(props) {
  return (
    <Glyph {...props}>
      <Line x1="6" y1="6" x2="18" y2="18" />
      <Line x1="18" y1="6" x2="6" y2="18" />
    </Glyph>
  );
}

export function LogOutIcon(props) {
  return (
    <Glyph {...props}>
      <Path d="M15 20H6.5A1.5 1.5 0 0 1 5 18.5v-13A1.5 1.5 0 0 1 6.5 4H15" />
      <Polyline points="14 8.5 18.5 12 14 15.5" />
      <Line x1="18.5" y1="12" x2="9.5" y2="12" />
    </Glyph>
  );
}

export function SunIcon(props) {
  return (
    <Glyph {...props}>
      <Circle cx="12" cy="12" r="4" />
      <Line x1="12" y1="2.5" x2="12" y2="4.5" />
      <Line x1="12" y1="19.5" x2="12" y2="21.5" />
      <Line x1="2.5" y1="12" x2="4.5" y2="12" />
      <Line x1="19.5" y1="12" x2="21.5" y2="12" />
      <Line x1="5.6" y1="5.6" x2="7" y2="7" />
      <Line x1="17" y1="17" x2="18.4" y2="18.4" />
      <Line x1="18.4" y1="5.6" x2="17" y2="7" />
      <Line x1="7" y1="17" x2="5.6" y2="18.4" />
    </Glyph>
  );
}

export function MoonIcon(props) {
  return (
    <Glyph {...props}>
      <Path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </Glyph>
  );
}

export function DeviceIcon(props) {
  return (
    <Glyph {...props}>
      <Rect x="2.5" y="4.5" width="19" height="12" rx="2" />
      <Line x1="8.5" y1="20" x2="15.5" y2="20" />
      <Line x1="12" y1="16.5" x2="12" y2="20" />
    </Glyph>
  );
}

export function GoogleIcon({ size = 20 }) {
  // Brand mark keeps its official colours, so it does not take the monochrome stroke treatment.
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4h6.6c-.1 1.1-.9 2.8-2.5 3.9l-.02.15 3.6 2.8.25.02c2.3-2.1 3.6-5.2 3.6-8.7Z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.3 0 6-1.1 8-2.9l-3.8-3c-1 .7-2.4 1.2-4.2 1.2a7.3 7.3 0 0 1-6.9-5l-.14.01-3.7 2.9-.05.14A12 12 0 0 0 12 24Z"
      />
      <Path
        fill="#FBBC05"
        d="M5.1 14.3a7.4 7.4 0 0 1 0-4.6l-.01-.16-3.75-2.9-.12.06a12 12 0 0 0 0 10.8l3.88-3Z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.7c2.3 0 3.9 1 4.8 1.8l3.5-3.4A12 12 0 0 0 12 0 12 12 0 0 0 1.2 6.7l3.9 3a7.3 7.3 0 0 1 6.9-5Z"
      />
    </Svg>
  );
}

export function AppleIcon({ size = 20, color = '#000000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M16.7 12.7c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.2 10.1.8 1.2 1.8 2.6 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.5.9-1.4 1.3-2.8 1.3-2.9-.1 0-2.5-1-2.5-3.9ZM14.2 4.4c.7-.8 1.1-2 1-3.2-1 0-2.3.7-3 1.5-.7.7-1.2 1.9-1 3 1.1.1 2.3-.5 3-1.3Z"
      />
    </Svg>
  );
}
