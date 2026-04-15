function hideLoader(){ setTimeout(()=>{
 document.getElementById('loader').style.display='none';
},1000)}

function showToast(msg){
 let t=document.getElementById('toast');
 t.innerText=msg; t.style.display='block';
 setTimeout(()=>t.style.display='none',3000);
}

function login(){
 let e=document.getElementById('email').value;
 let p=document.getElementById('password').value;
 if(e==='admin@test.com' && p==='1234'){
  window.location='dashboard.html';
 } else showToast('Invalid Login ❌');
 return false;
}

function updateStatus(btn,status){
 let row=btn.parentElement.parentElement;
 let badge=row.querySelector('.badge');
 badge.className='badge '+status;
 badge.innerText=status;
}

function searchTable(){
 let val=document.getElementById('search').value.toLowerCase();
 let rows=document.querySelectorAll('#appTable tr');
 rows.forEach((r,i)=>{
  if(i===0)return;
  let name=r.cells[1].innerText.toLowerCase();
  r.style.display=name.includes(val)?'':'none';
 });
}

window.onload=function(){
 let ctx=document.getElementById('myChart');
 if(ctx){
  new Chart(ctx,{ type:'bar',
   data:{ labels:['Pending','Approved','Rejected'],
    datasets:[{ data:[5,8,2], backgroundColor:['orange','green','red'] }]
   }
  });
 }
}
