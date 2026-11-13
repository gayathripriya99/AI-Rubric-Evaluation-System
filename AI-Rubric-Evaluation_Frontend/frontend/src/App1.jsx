import { useState } from "react";


function rubricAi() {
    const Questions = [{ id: 1, label: "how you will manage the heavy customers" }
        , { id: 2, label: "how you will serve the clients if the things is not in the menu" },
    { id: 3, label: "what is your answer when they asked for discount of food" },
    { id: 4, label: "how you will manage taht the payment type is not in your resturtant he has dollars money" },
    { id: 5, label: "how you undersatnd that what the custemer is saying if you dont know that waht he is saying" }]
    const [isLoading, setisLoading] = useState(false);
    const [evaluation, setEvaluation] = useState([]);
    const [questions, setquestions] = useState(Questions);
    const [answers, setAnswers] = useState([{ 1: "", 2: "", 3: "", 4: "", 5: "" }]);
const[sucessfullysubmitted,setSucessfullysubmitted]= useState(false);
const handleSubmit = (event) =>{
event.preventDefault();
setSucessfullysubmitted(false)
 const payload ={submitted:answers}
 console.log(payload,"payload")
 setEvaluation(payload)
 setSucessfullysubmitted(true)
}

const handleInputChange = (id,text)=>{
    setAnswers((prevanswer) => ({
         ...prevanswer , [id]:text})
    )

}
    console.log(questions, "Questions")
    return (
        <>
            <div style={{
                display: "flex", backgroundColor: "white", height
                    : "100vh", width: "100vw", paddingInline: "0px", flexDirection: "row", justifyContent: "center", flexWrap: "wrap"
            }}>
                <header style={{
                    display: "flex",
                    fontSize: "28px", fontWeight: "600",
                    justifyContent: "center",
                    alignItems: "flex-start"
                }}
                >
                    <p style={{ fontSize: "28px", fontWeight: "600", color: "black" }}>   Welocome to AI Auto Rubric Evalaution System</p>

                </header>


{sucessfullysubmitted ?  (
    <>
    <p style={{ fontSize: "34px", fontWeight: "800", color: "black" }}> Your Response is Recorded</p>
    </>
) :<>                    

 <form onSubmit={handleSubmit}>
                <div style={{
                    border: "5px solid gray",
                    display: "flex",
                    justifyContent: "center", alignItems: "center",
                    flexWrap: "wrap", height
                        : "100vh", width: "100vw",
                    overflowInline: "scroll"
                }}>
                    <>
                        {
                            questions?.map((value, index) => {
                                console.log(value, index, "checkvalueBefore_map")
                                return (
                                    <>
                                        <div style={{ lineBreak: "10px" }} key={value.id}>
                                            <p style={{color:"black",fontWeight:"500"}}>
                                                {value.id}:{value.label}</p>
                                      
                                           <textarea
placeholder= "Write your response here"
row ={5}
id ={`question-${value.id}`}
value={answers[value.id]}
onChange={(event)=>handleInputChange(value.id,event.target.value)}
                                                >


                                                </textarea>


                   

                                        </div>
                                    </>
                                )




                            })}
                    </>
 <button style={{
                        border: "10px",
                        borderRadius: "10px",
                        width: "90px",

                        height: "90px"
                        , backgroundColor: "blue", color: "white"
                    }}
                
                    
                    >
                        submit Response

                    </button>
                </div>
</form></>}

                <footer style={{
                    display: "flex", backgroundColor: "white"
                    , justifyContent: "center", alignItems: "flex-end"
                }}>successfully building an ai application</footer>

            </div>

        </>
    )




}
export default rubricAi;
