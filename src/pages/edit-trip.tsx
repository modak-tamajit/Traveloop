import {useParams} from "react-router-dom"
import {TripForm} from "@/pages/add-trip"
export function EditTripPage(){const {id}=useParams();return <TripForm title="Edit Trip" eyebrow={`Trip ${id}`} action="Save changes"/>}
