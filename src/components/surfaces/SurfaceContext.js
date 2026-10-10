// #genai: Tells a control what it is sitting on, so it can pick the right contrast.
//
// A white field on a white card disappears; on the canvas or a glass pane it should read as a raised
// white pill. Rather than every screen passing a flag to every field, `Surface` provides the ground
// and fields consult it:
//   canvas  the lit page itself (the default)
//   card    a solid raised surface — controls recess into it
//   glass   a translucent pane — controls stay raised and white
import { createContext, useContext } from 'react';

export const SurfaceContext = createContext('canvas');

export function useSurfaceGround() {
  return useContext(SurfaceContext);
}
