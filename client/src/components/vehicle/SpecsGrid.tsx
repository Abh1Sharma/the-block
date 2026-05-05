import type { Vehicle } from '@/types/vehicle'
import { formatOdometer, formatBodyStyle, formatFuelType } from '@/lib/formatters'

interface Props {
  vehicle: Vehicle
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  )
}

export function SpecsGrid({ vehicle }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
      <SpecItem label="Year" value={String(vehicle.year)} />
      <SpecItem label="Make" value={vehicle.make} />
      <SpecItem label="Model" value={vehicle.model} />
      <SpecItem label="Trim" value={vehicle.trim} />
      <SpecItem label="Body Style" value={formatBodyStyle(vehicle.body_style)} />
      <SpecItem label="Odometer" value={formatOdometer(vehicle.odometer_km)} />
      <SpecItem label="Engine" value={vehicle.engine} />
      <SpecItem label="Transmission" value={vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1)} />
      <SpecItem label="Drivetrain" value={vehicle.drivetrain} />
      <SpecItem label="Fuel Type" value={formatFuelType(vehicle.fuel_type)} />
      <SpecItem label="Exterior" value={vehicle.exterior_color} />
      <SpecItem label="Interior" value={vehicle.interior_color} />
      <SpecItem label="VIN" value={vehicle.vin} />
      <SpecItem label="Location" value={`${vehicle.city}, ${vehicle.province}`} />
      <SpecItem label="Dealer" value={vehicle.selling_dealership} />
    </div>
  )
}
