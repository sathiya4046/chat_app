function validate(values) {
    let error = {}
    const email_pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/
  
    if(!values.name){
        error.name = "Required"
    }
    else {
        error.name = ""
    }
  
    if(!values.email){
        error.email = "Required"
    }
    else if(!email_pattern.test(values.email)){
        error.email = "Email doesn't match as format"
    } else{
        error.email = ""
    }
  
    if(!values.password) {
        error.password = "Required"
    }
    else if(!password_pattern.test(values.password)) {
        error.password = "Password doesn't match, eg : Example@123"
    }else{
      error.password = ""
    }

    if(!values.cpassword){
        error.cpassword = "Required"
    }else if(values.password===values.cpassword) {
        error.cpassword = ""
    }else{
      error.cpassword = "Password mismatch"
    }

    return error;
  }

  export default validate