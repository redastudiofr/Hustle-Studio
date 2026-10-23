// react-dom's web-streams server build (see app/entry.server.tsx).
declare module 'react-dom/server.browser' {
  export {renderToReadableStream} from 'react-dom/server';
}
