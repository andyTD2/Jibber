export default function MetricsBanner({metrics})
{
    return (
        <div className="flex">
            {
                Object.entries(metrics).map(([key, value], index) => 
                    <div className={`${index == 0 ? "pr-3" : "px-3"} border-r-2 border-zinc-600`} key={index}>
                        <div className="text-zinc-400">{key}</div>
                        <div>{value}</div>
                    </div>
                )
            }
        </div>
    )
}