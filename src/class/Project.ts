import { v4 as uuidv4 } from "uuid"

export type ProjectStatus = "Architect" | "Engineer" | "Developer"
export type UserRole = "Pending" | "Active" | "Finished"

export interface IProject {
    name: string
    description: string
    status: ProjectStatus
    userRole: UserRole
    finishDate: Date
}

export class Project implements IProject {

    // To satisfy IProject type
    name: string
    description: string
    status: "Architect" | "Engineer" | "Developer"
    userRole: "Pending" | "Active" | "Finished"
    finishDate: Date

    //Class internal type
    ui: HTMLDivElement
    cost: number = 0
    progress: number = 0
    id: string

    //Constructor
    constructor(data: IProject) {

        //Project Data Definition
        for(const key in data) {
            this[key] = data[key]
        }

        this.id = uuidv4()

        this.setUI()

    }

    //Defining the method to create the card UI
    setUI() {
        
        //Este if statement previene que se ejecute el código si ya se ha creado una project card en la pagina
        if(this.ui) {return}

        //Crea el project card en la pagina
        this.ui = document.createElement("div")
        this.ui.className = "project-card"
        this.ui.innerHTML = `
        <div class="card-header">
            <p style="background-color: #ca8134; padding: 10px; border-radius: 8px; aspect-ratio: 1;">
             HC
            </p>
            <div>
                <h5>${this.name}</h5>
                <p>${this.description}</p>
            </div>
        </div>
        <div class="card-content">
            <div class="card-property">
                <p style="color: #969696">Status</p>
                <p>${this.status}</p>
            </div>
            <div class="card-property">
                <p style="color: #969696">Role</p>
                <p>${this.userRole}</p>
            </div>
            <div class="card-property">
                <p style="color: #969696">Cost</p>
                <p>$${this.cost}</p>
            </div>
            <div class="card-property">
                <p style="color: #969696">Estimated Progress</p>
                <p>${this.progress}%</p>
            </div>
        </div>`
    }
}