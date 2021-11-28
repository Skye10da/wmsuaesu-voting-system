$(document).ready( async () => {
    const video = document.getElementById('facial')
    const capture = document.getElementById('fc')
    let regdata = new FormData()
    //camera capture
    let cameraStream = null, vidPlaying = false
    const mediaSupport = 'mediaDevices' in navigator 
    if (mediaSupport && null == cameraStream) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(function (mediaStream) {
            cameraStream = mediaStream
            video.srcObject = mediaStream
            video.play()
        }).catch(function (err) {
            console.log(err)
            Swal.fire({
                icon: 'info', 
                title: 'Unable to acess the camera', 
                html: 'Please restart your browser', 
                backdrop: true, 
                allowOutsideClick: false, 
            })
        })
    } else {
        Swal.fire({
            icon: 'info', 
            title: 'Unsupported Browser', 
            html: 'We Suggest to use Chrome or Mozilla Browser', 
            backdrop: true, 
            allowOutsideClick: false, 
        })
    }
    video.addEventListener('playing', () => {
        vidPlaying = true
    })
    $(".capture").click( function() {
        const captured = $(this).attr("captured") === "true" ? true : false 
        if(!captured && vidPlaying){
            let timerInterval
            Swal.fire({
                icon: 'question', 
                title: 'Start Capture', 
                html: 'Please position your face properly', 
                backdrop: true, 
                allowOutsideClick: false, 
                showDenyButton: true, 
                confirmButtonText: "Yes"
            }).then( (a) => {
                if(a.isConfirmed){
                    Swal.fire({
                        icon: 'info',
                        title: 'Please Wait',
                        html: 'Capturing in <b></b> milliseconds.',
                        timer: 1000,
                        timerProgressBar: true,
                        didOpen: () => {
                            Swal.showLoading()
                            const b = Swal.getHtmlContainer().querySelector('b')
                            timerInterval = setInterval(() => {
                                b.textContent = Swal.getTimerLeft()
                            }, 100)
                        },
                        willClose: () => {
                            clearInterval(timerInterval)
                        }
                    }).then( (result) => {
                        if (result.dismiss === Swal.DismissReason.timer) {
                            setTimeout( async () => {
                                if (null != cameraStream) {
                                    for(let i = 0; i < 2; i++){
                                        var ctx = capture.getContext('2d')
                                        var img = new Image() 
                                        ctx.drawImage(video, 0, 0, capture.width, capture.height) 
                                        img.src = capture.toDataURL("image/jpeg")
                                        img.width = 250
                                        const res = await fetch(img.src)
                                        const blob = await res.blob()
                                        const file = new File([blob], `${i + 1}.jpg`, blob)
                                        regdata.append("facialreg", file)
                                    }
                                    video.classList.add("hidden")
                                    capture.classList.remove("hidden")
                                    $(this).text("Re-capture")
                                    $(this).attr("captured", "true")
                                }
                            }, 1000)
                        }
                    })
                }
            })
        } else {
            video.classList.remove("hidden")
            capture.classList.add("hidden")
            $(this).text("Capture")
            $(this).attr("captured", "false")
            regdata.delete("facialreg")
        }
    })
    let upload = false
    $(".upload-fc").submit( function (e) {
        e.preventDefault() 
        if(!upload){
            Swal.fire({
                icon: 'question', 
                title: 'Submit Facial Data', 
                backdrop: false, 
                allowOutsideClick: false, 
                showDenyButton: true, 
                confirmButtonText: 'Submit', 
                denyButtonText: 'Cancel'
            }).then( (a) => {
                if(a.isConfirmed){
                    Swal.fire({
                        icon: 'info', 
                        title: 'Submitting Facial Data', 
                        html: 'Please wait...', 
                        backdrop: false, 
                        allowOutsideClick: false, 
                        showConfirmButton: false, 
                        willOpen: async () => {
                            Swal.showLoading() 
                            try {
                                upload = true
                                const req = await fetchtimeout("/account/facial/register/", {
                                    method: 'POST', 
                                    headers: {
                                        'X-CSRF-TOKEN': $("meta[name='csrf-token']").attr("content")
                                    }, 
                                    body: regdata
                                })
                                if(req.ok){
                                    const res = await req.json()
                                    regdata.delete("facialreg")
                                    console.log(res)
                                    Swal.fire({
                                        icon: res.status ? 'success' : 'info', 
                                        title: res.txt, 
                                        html: res.msg, 
                                        backdrop: false, 
                                        allowOutsideClick: false, 
                                        showConfirmButton: res.status ? false : true, 
                                        willOpen: () => {
                                            if(res.status){
                                                Swal.showLoading()
                                                window.location.assign('/home')
                                            }
                                        }
                                    })
                                } else {
                                    throw new Error(`${req.status} ${req.statusText}`)
                                }
                            } catch (e) {
                                regdata.delete("facialreg")
                                upload = false
                                Swal.fire({
                                    icon: 'error', 
                                    title: 'Connection error', 
                                    html: e.message, 
                                    backdrop: false, 
                                    allowOutsideClick: false, 
                                })
                            }
                        }
                    })
                }
            })
        }
    })
    function stopcamera() {
        if (null != cameraStream) {
            var track = cameraStream.getTracks()[0]
            track.stop()
            stream.load()
            cameraStream = null
        }
    }
})