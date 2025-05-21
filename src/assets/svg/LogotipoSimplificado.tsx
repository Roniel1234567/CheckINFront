import { SVGProps } from "react"

const LogotipoSimplificado = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 300 60" 
    preserveAspectRatio="xMidYMid meet"
    {...props}
  >
    <text 
      x="15" 
      y="40" 
      fontFamily="Arial, sans-serif" 
      fontSize="40" 
      fontWeight="bold" 
      fill="#0E2A47"
    >
      Work in School
    </text>
    <path d="M130 50L240 10" stroke="#DDB152" stroke-width="5" stroke-linecap="round"/>
  </svg>
)

export default LogotipoSimplificado 