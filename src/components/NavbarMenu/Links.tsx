import tw from 'tailwind-styled-components'
import { Link } from 'gatsby'

const LinkBase = tw(Link)`
	flex 
	items-center 
	justify-center
	my-4
	mx-6
	h-12
	align-middle
`

const ProjectsLink = tw(LinkBase)`
	font-bold
	text-3xl

	text-primary-500
	hover:text-accent-500
`

const PostsLink = tw(LinkBase)`
	font-bold

	text-2xl
	text-primary-500
	hover:text-accent-500
`
const OtherLink = tw(LinkBase)`
	text-xl

	text-primary-500
	hover:text-accent-500
`

export {ProjectsLink, PostsLink, OtherLink}
