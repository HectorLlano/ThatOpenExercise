import { Project, IProject } from "./Project.ts"

export class ProjectsManager {
    list: Project[] = []
    ui: HTMLElement

    constructor(container: HTMLElement) {
        this.ui = container
    }

    newProject(data: IProject) {
        const projectNames = this.list.map((project) => {
            return project.name
        })
        const nameInUse = projectNames.includes(data.name)
        if(nameInUse) {
            throw new Error(`A project with the name "${data.name}" already exists`)
        }
        const project = new Project(data)
        project.ui.addEventListener('click', () => {
            const projectsPage = document.getElementById("projects-page")
            const detailsPage = document.getElementById("project-details")
            if(!projectsPage || !detailsPage) {return}
            projectsPage.style.display = "none"
            detailsPage.style.display = "flex"
            this.setDetailsPage(project)
        })
        this.ui.append(project.ui)
        this.list.push(project)
        return project
    }

    private setDetailsPage(project: Project) {
        const detailsPage = document.getElementById("project-details")
        if(!detailsPage) {return}
        const name = detailsPage.querySelector("[data-project-info='name']")
        if(name) {
            name.textContent = project.name
        }
        const description = detailsPage.querySelector("[data-project-info='description']")
        if(description) {
            description.textContent = project.description
        }
        const projectName = detailsPage.querySelector("[data-project-info='project-name']")
        if(projectName) {
            projectName.textContent = project.name
        }
        const projectDescription = detailsPage.querySelector("[data-project-info='project-description']")
        if(projectDescription) {
            projectDescription.textContent = project.description
        }
        const projectStatus = detailsPage.querySelector("[data-project-info='project-status']")
        if(projectStatus) {
            projectStatus.textContent = project.status
        }
        const projectRole = detailsPage.querySelector("[data-project-info='project-role']")
        if(projectRole) {
            projectRole.textContent = project.userRole
        }
        const projectFinishDate = detailsPage.querySelector("[data-project-info='project-finishDate']")
        if(projectFinishDate) {
            const day = project.finishDate.getUTCDay()
            const month = project.finishDate.getUTCMonth() + 1
            const year = project.finishDate.getUTCFullYear()
            projectFinishDate.textContent = year.toString() + "/" + month.toString() + "/" + day.toString()
        }
    }

    getProject(id: string) {
        const project = this.list.find((project) => {
            return project.id === id
        })
        return project
    }

    getProjectByName(name: string) {
        const project = this.list.find((project) => {
            return project.name === name
        })
    }

    totalProjectsCost() {
        let totalProjectsCost: number = 0

        this.list.forEach((project) => {
            totalProjectsCost += project.cost
        })

        return totalProjectsCost
    }

    deleteProject(id: string) {
        const project = this.getProject(id)
        if(!project) {return}

        project.ui.remove()

        const remaining = this.list.filter((project) => {
            return project.id !== id
        })
        this.list = remaining
    }

    exportToJSON(filename: string = "projects") {
        function replacer(key: string, value: string) {
            if(key === "ui") {return undefined}
            return value
        }
        const json = JSON.stringify(this.list, replacer, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    importFromJSON() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            const json = reader.result
            if(!json) {return}
            const projects: IProject[] = JSON.parse(json as string)
            for(const project of projects) {
                try {
                    this.newProject(project)
                }catch(error){
                    console.log(error);
                    
                }
            }
        })
        input.addEventListener('change', () => {
            const filesList = input.files
            if(!filesList) {return}
            reader.readAsText(filesList[0])
        })
        input.click()
    }
}