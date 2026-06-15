export interface KPIDetail {
  pct: number;
  label: string;
  detail: string;
}

export interface KPIData {
  kehadiran: KPIDetail;
  tilawah: KPIDetail;
  tahfiz: KPIDetail;
  adab: KPIDetail;
}

export interface ChartDataPoint {
  week: string;
  kehadiran: number;
  tilawah: number;
  tahfiz: number;
  adab: number;
}
