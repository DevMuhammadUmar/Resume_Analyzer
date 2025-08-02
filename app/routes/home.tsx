import type {Route} from "./+types/home";
import Navbar from "~/components/Navbar";
import {resumes} from "../../constants";
import ResumeCard from "~/components/ResumeCard";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "JobMatch Pro"},
        {name: "description", content: "Turn your resume into your AI-driven competitive advantage"},
    ];
}


export default function Home() {
    return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar/>
        <section className="main-section">
            <div className="page-heading py-16">
                <h1>Achieve Your Career Goals One Application at a time</h1>
                <h2>Turn rejection into redirection, tracking into triumph</h2>
            </div>
            {resumes.length > 0 && (
                <div className="resumes-section">
                    {resumes.map((resume) => (
                        <ResumeCard key={resume.id} resume={resume}/>
                    ))}
                </div>)}
        </section>

    </main>
}
