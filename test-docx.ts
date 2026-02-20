import { generateDocx } from './lib/docxGenerator';
import type { RewrittenResume } from './lib/types';
import fs from 'fs';

const dummy: RewrittenResume = {
    name: "John Doe",
    contact_info: "123 Main St",
    linkedin: "linkedin.com",
    professional_profile: "A great worker",
    experience: [
        {
            title: "Manager",
            company: "Acme",
            dates: "2020 - Present",
            bullets: ["Did a thing", "Did another thing"]
        }
    ],
    education: [
        {
            degree: "BS",
            school: "University",
            dates: "2015-2019"
        }
    ],
    skills: ["TypeScript", "Node.js"],
    projects: []
};

generateDocx(dummy).then(buffer => {
    fs.writeFileSync('test.docx', buffer);
    console.log('Success!');
}).catch(console.error);
