type CsvDropzoneProps = {
    fileName: string | null
    error: string | null
    onFile: (file: File) => void
    onClear: () => void
}

export function CsvDropzone({
    fileName,
    error,
    onFile,
    onClear,
}: CsvDropzoneProps) {
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
                Перетащите файл сюда или нажмите, чтобы выбрать. Данные
                сохраняются в этом браузере и не пропадут после перезагрузки.
            </span>
            {fileName ? (
                <span className="dropzone-file">Сохранено: {fileName}</span>
            ) : null}
            {error ? <span className="dropzone-error">{error}</span> : null}
            {fileName ? (
                <button
                    type="button"
                    className="ghost dropzone-clear"
                    onClick={event => {
                        event.preventDefault()
                        event.stopPropagation()
                        onClear()
                    }}>
                    Удалить сохранённые данные
                </button>
            ) : null}
        </label>
    )
}
