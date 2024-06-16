import { useEffect, useRef, useState } from "react"
import { LangType } from "./@types/LangType";

export default function App() {

    const [output,setOutput] = useState<{ google: string, papago: string, deepL: string } | undefined>();
    const refInput = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        window.electron.receive("translate-complete", (l, data) => {
            setOutput(data);
        })

        window.electron.receive("error", (l, data) => {
            alert(data);
            console.error(data);
        })
    },[]);

    function onClick_SubmitButton() {
        if(refInput.current) {
            const value = refInput.current.value

            if(value) {
                window.electron.send("translate", { source: value, startLang: LangType.KO, targetLang: LangType.EN });
            }
        }
    }

    return (
        <div>
            <div>
                <textarea placeholder="번역할 내용" ref={refInput}></textarea>
                <button onClick={onClick_SubmitButton}>번역</button>
            </div>

            <div>

                <div>
                    <div>DeepL</div>
                    <textarea placeholder="번역된 내용" defaultValue={output?.deepL}></textarea>
                </div>

                <div>
                    <div>파파고</div>
                    <textarea placeholder="번역된 내용" defaultValue={output?.papago}></textarea>
                </div>

                <div>
                    <div>구글 번역기</div>
                    <textarea placeholder="번역된 내용" defaultValue={output?.google}></textarea>
                </div>
            </div>
        </div>
    )
}