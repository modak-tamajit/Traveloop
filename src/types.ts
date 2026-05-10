export type UserRole="user"|"admin"
export type TripStatus="draft"|"planned"|"active"|"completed"|"archived"
export type UserProfile={id:string;email:string;fullName:string;role:UserRole}
export type Trip={id:string;userId:string;title:string;destination:string;startDate:string;endDate:string;status:TripStatus;primaryCityId?:string;coverImageUrl?:string;isPublic:boolean}
export type NavItem={label:string;href:string;icon:React.ComponentType<{className?:string}>;protected?:boolean;adminOnly?:boolean}
