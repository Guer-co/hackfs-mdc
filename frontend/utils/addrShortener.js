import ReactHtmlParser from 'react-html-parser';

export default function (addr) {
  return ReactHtmlParser(
    addr.substring(0, 6) +
      '...' +
    addr.substring(addr.length - 4, addr.length)
  );
}
