const answers: string[] = JSON.parse(localStorage.getItem('answers') || '[]')

export const saveAnswer = (id: string) => {
    answers.push(id)

    localStorage.setItem('answers', JSON.stringify(answers))
}

export const hasAnswer = (id: string) => {
    return answers.includes(id)
}
