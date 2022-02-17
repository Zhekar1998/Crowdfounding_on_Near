
var NewComponent = React.createClass({
    render: function() {
        return (

            <div classname="card shadow-sm">
                <div id="carouselIndicators" width="100%" height={225} classname="carousel slide" data-bs-ride="carousel">
                    <div classname="carousel-indicators">
                        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to={0} classname="active" aria-current="true" aria-label="Slide 1">
                        </button><button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to={1} aria-label="Slide 2">
                    </button><button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to={2} aria-label="Slide 3">
                    </button></div>
                    <div classname="carousel-inner">
                        <div classname="carousel-item active">
                            <img src classname="d-block w-100" alt="..." />
                        </div>
                        <div classname="carousel-item">
                            <img src classname="d-block w-100" alt="..." />
                        </div>
                        <div classname="carousel-item">
                            <img src classname="d-block w-100" alt="..." />
                        </div>
                    </div>
                    <button classname="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
            <span classname="carousel-control-prev-icon" aria-hidden="true">
              <span classname="visually-hidden">Previous</span>
            </span></button>
                    <button classname="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
            <span classname="carousel-control-next-icon" aria-hidden="true">
              <span classname="visually-hidden">Next</span>
            </span></button>
                </div>
                <div classname="card-body">
                    <p classname="card-text">text</p>
                    <div className="progress">
                        <div className="progress-bar" role="progressbar" style={{width: '25%'}} aria-valuenow={25}
                             aria-valuemin={0} aria-valuemax={100}>25%
                        </div>
                    </div>
                    <div classname="d-flex justify-content-between align-items-center">
                        <div classname="btn-group">
                            <button type="button" classname="btn btn-sm btn-outline-secondary">View</button>
                            <button type="button" classname="btn btn-sm btn-outline-secondary">Donate</button>
                        </div>
                        <small classname="text-muted">9 mins</small>
                    </div>
                </div>
            </div>
        );
    }
});

const domContainer = document.getElementById("col");



