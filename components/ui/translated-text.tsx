"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface TProps {
  k: string;
  values?: Record<string, string | number>;
}

export function T({ k, values }: TProps): ReactNode {
  const { t } = useTranslation();
  return values ? t(k, values) : t(k);
}
