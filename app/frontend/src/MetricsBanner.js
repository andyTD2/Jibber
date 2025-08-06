/*
    MetricsBanner displays some useful or informative metrics. Typically, it is attached to a Banner
    component.

    metrics (obj, required): An object containing metric information used to render the component

        Format is as follows:
        
        {
            "name_of_metric": "metric_value",
            "Subscribers": "40000"
        }
*/
export default function MetricsBanner({metrics})
{
    return (
        <div className="flex sm:text-sm mr-2">
            {
                Object.entries(metrics).map(([key, value], index) => 
                    <div className={`${index == 0 ? "pr-3" : "px-3"} border-r-2 last:border-r-0 border-zinc-600 text-base`} key={index}>
                        <div className="dark:text-zinc-400 text-primary1">{key}</div>
                        <div className="dark:text-darkText1 text-lightText1">{value}</div>
                    </div>
                )
            }
        </div>
    )
}