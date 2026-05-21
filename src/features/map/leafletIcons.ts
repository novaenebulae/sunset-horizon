import L from 'leaflet'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import icon from 'leaflet/dist/images/marker-icon.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'

export const observerIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const blockingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
  <circle cx="14" cy="14" r="10" fill="#38BDF8" stroke="#0B1020" stroke-width="2"/>
  <circle cx="14" cy="14" r="4" fill="#0B1020"/>
</svg>`

export const blockingIcon = L.icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(blockingSvg)}`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})
