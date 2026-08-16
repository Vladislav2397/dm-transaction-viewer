type CsvDropzoneProps = {
    onFile: (file: File) => void
}

export function CsvDropzone({ onFile }: CsvDropzoneProps) {
    function handleFiles(files: FileList | null) {
        const file = files?.[0]
        if (file) {
            onFile(file)
        }
    }

    return (
        <label
            className="dropzone"
            onDragOver={event => event.preventDefault()}
            onDrop={event => {
                event.preventDefault()
                handleFiles(event.dataTransfer.files)
            }}>
            <input
                type="file"
                accept=".csv,text/csv"
                onChange={event => {
                    handleFiles(event.target.files)
                    event.currentTarget.value = ""
                }}
            />
            <strong>CSV</strong>
            <span>
                Перетащите файл сюда или нажмите, чтобы выбрать. Данные
                сохраняются в этом браузере.
            </span>
        </label>
    )
}
