import { useEffect, useState } from 'react';

export interface UrlParams {
  code: string;
  src: string;
  racText: string;
  gclid: string;
}

export function useUrlParams(): UrlParams {
  const getParamsFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code') || '';
    const src = urlParams.get('src') || '';
    const racText = urlParams.get('rac_text') || '';
    const gclid = urlParams.get('gclid') || '';
    const isValidCode = code ? /^\d{4}$/.test(code) : false;

    return {
      code: isValidCode ? code : '',
      src,
      racText,
      gclid,
    };
  };

  const [params, setParams] = useState<UrlParams>(getParamsFromUrl);

  useEffect(() => {
    const handleUrlChange = () => {
      setParams(getParamsFromUrl());
    };

    window.addEventListener('popstate', handleUrlChange);
    handleUrlChange();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  return params;
}
