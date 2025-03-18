export default interface TitleBar {
    title: string
    href: string
    setStatePage: React.Dispatch<React.SetStateAction<number>>
    statePage: number
}