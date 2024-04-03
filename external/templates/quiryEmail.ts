
export const queryEmailTemplate = (data: any) => {
    const { cname, fname, lname, email, enquiryMessage } = data

    return `<table> 
                    <tr> <td>Company Name</td> <td> ${cname} </td></tr> 
                    <tr> <td>First Name</td> <td> ${fname} </td></tr> 
                    <tr> <td>Last Name</td> <td> ${lname} </td></tr> 
                    <tr> <td>Email Address</td> <td> ${email} </td></tr> 
                    <tr> <td>Enquiry Message</td> <td> ${enquiryMessage} </td></tr> 
                    </table>`

}

export const subscriberEmailTemplate = (email) => {

    return `<table> 
    <tr> <td>Subscriber Email</td> <td> ${email} </td></tr> 
    </table>`

}
