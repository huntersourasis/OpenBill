const sendHttpResponse = ( res , code , success , msg , data) => {
    return res.status(code).json({
        success : success,
        msg : msg ,
        data : data
    })
};

export {sendHttpResponse};