import Header from "../Headers/Header"; 
import './Card.css'

export const Card = () => {
  return (
    <div>
        
    </div>
  )
};

export const CardHeader = () => {
    return (
        <>
        <img alt="" />
        <Header></Header>
        </>
    )
};

export const CardContent = ({children}) => {
    return <p>{children}</p>
}


CardContent.defaultProps = {}