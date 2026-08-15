type CsvDropzoneProps = {
    fileName: string | null
    error: string | null
    onFile: (file: File) => void
}

export function CsvDropzone({ fileName, error, onFile }: CsvDropzoneProps) {
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
            <strong>Загрузить CSV</strong>
            <span>
                Перетащите файл сюда или нажмите, чтобы выбрать. Формат как в
                example.csv.
            </span>
            {fileName ? (
                <span className="dropzone-file">Текущий файл: {fileName}</span>
            ) : null}
            {error ? <span className="dropzone-error">{error}</span> : null}
        </label>
    )
}
