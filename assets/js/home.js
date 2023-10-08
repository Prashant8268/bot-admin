  let deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach((item)=>{
        item.addEventListener('click',async(event)=>{
            // event.preventDefault();
            const id = item.id;;
            await $.ajax({
                type: 'get',
                url: `/delete-subscriber?id=${id}`,
                success: (data)=>{    
                    const id = data.id;
                    let liTag = document.getElementById(`li-${id}`);
                    liTag.remove();

                },
                error: (err)=>{
                    console.log(err, '<--err at homepost.js')
                }
            })


        })
    })
